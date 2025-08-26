<template>
  <div class="content">
    <h2>계좌 등록</h2>
    <div class="popup-wrap">
      <div class="mg-t-10" v-if="!this.selectedBank">
        <div class="searchSelect">
          <input class="form-control" placeholder="증권사를 검색해주세요" @focus="isDropdownOpen = true" @input="searchBankInput">
          <i class="ti-angle-down" @click="isDropdownOpen = !isDropdownOpen"></i>
        </div>
        <ul class="searchSelectBox" v-show="isDropdownOpen">
          <li v-for="bank in copiedBanks" :key="bank.code || bank.bankCode" @click="selectBank(bank)">
            <img class="bank-icon" :src="'./bank-icons/'.concat(bank.bankCode).concat('.jpg')"
                 @error="replaceBankDefaultImg">
            <span>{{ bank.bankName }}</span>
          </li>
        </ul>
      </div>
      <div v-else class="mg-t-10">
        <div class="selected-bank-wrap" @click="cancelSelectBank">
          <li>
            <img class="bank-icon" :src="'./bank-icons/'.concat(selectedBank.bankCode).concat('.jpg')"
                 @error="replaceBankDefaultImg">
            <span style="vertical-align: middle;">{{ selectedBank.bankName }}</span>
          </li>
        </div>
      </div>
      <div class="mg-t-10 flex inputBox">
        <input class="form-control" type="text" v-model="alias" placeholder="계좌 별칭을 입력해주세요.">
      </div>
      <div class="btnBox t-a-c">
        <button type="button" @click="saveBank">등록</button>
      </div>
    </div>
  </div>
</template>

<script>
import { useNotify } from '@/composables/useNotify'
import { useLoading } from '@/composables/useLoading'
export default {
  name: "SaveBankAccount",
  props: {
    msg: String,
  },
  data() {
    return {
      banks: null,
      copiedBanks: null,
      selectedBank: null,
      alias: null,
      timeout: null,
      isUpdating: false,
      isDropdownOpen: false,
    }
  },
  async beforeMount() {
    const { AccountsService } = await import('@/service/accounts')
    let res = await AccountsService.getBanks();
    this.banks = JSON.parse(JSON.stringify(res.data));
    this.copiedBanks = this.banks.slice();
    this.closeDropDown();
  },
  watch: {
    isUpdating(val) {
      clearTimeout(this.timeout)

      if (val) {
        this.timeout = setTimeout(() => (this.isUpdating = false), 3000)
      }
    },
  },
  methods: {
    replaceBankDefaultImg(e) {
      e.target.src = './bank-icons/default-bank.png';
    },
    searchBankInput(event) {
      const v = event.target.value || ''
      this.copiedBanks = this.banks.filter(item => item.bankName.includes(v))
    },
    selectBank(bank) {
      this.isDropdownOpen = false;
      this.selectedBank = bank;
    },
    cancelSelectBank() {
      this.selectedBank = null;
    },
    async saveBank() {
      const { success, error } = useNotify()
      const { start, stop } = useLoading()
      if (!this.selectedBank) {
        error("증권사를 선택해주세요")
        return;
      }

      if (!this.alias) {
        error("계좌 별칭을 입력해주세요")
        return;
      }

      let param = {
        memberId: JSON.parse(sessionStorage.getItem('userInfo')).memberId,
        bank: this.selectedBank.code,
        alias: this.alias
      }
      const { AccountsService } = await import('@/service/accounts')
      start('계좌 등록 중...')
      try {
        let res = await AccountsService.saveAccount(param);
        if (res.data.code === 'SUCCESS') {
          success('등록되었습니다.')
          await this.getBankAccount();
          this.$parent.$parent.isShowRegAccountPop = false;
        } else if (res.data.message) {
          error(res.data.message)
        }
      } catch (e) {
        error('등록 중 오류가 발생했습니다.')
      } finally {
        stop()
      }
    },
    async getBankAccount() {
      const { AccountsService } = await import('@/service/accounts')
      let res = await AccountsService.getMemberAccounts(JSON.parse(sessionStorage.getItem('userInfo')).memberId);
      let userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
      userInfo.bankAccounts = res.data.accounts;
      const appStore = (await import('@/store')).useAppStore()
      appStore.setUserInfo(userInfo);
      sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
    },

  }
};
</script>
