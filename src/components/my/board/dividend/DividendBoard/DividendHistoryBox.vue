<template>
  <div class="content">
    <v-card class="mg-b-5" v-for="dividend in dividends" :key="dividend.id">
      <v-card-text>
        <div>
          <div style=" font-size: 12px;">
            <div>
              <div class="flex mg-b-5" style="justify-content: space-between">
                <p class="mg-r-10">{{dividend.year}}년 {{dividend.month}}월 {{dividend.day}}일</p>
                <i class="ti-trash" @click="removeHistory(dividend.id)"></i>
              </div>
              <div class="flex" style="justify-content: space-between">
                <div>
                  <p style="width: 200px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        word-break: break-all;
                            ">{{ dividend.name }}({{ dividend.symbol }})</p>
                </div>
                <div>
                  <p class="t-a-r">{{dividend.national !== 'KR' ? '$' : ''}}{{ dividend.dividend.toLocaleString('ko-KR')}} {{dividend.national == 'KR' ? '원' : ''}}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>


<script>

export default {
  name: "DividendBox",
  components: {},
  props: {
    dividends: Array,
  },
  methods: {
    async removeHistory(id) {
      if(confirm('삭제 하시겠습니까?')) {
        await this.axios.delete('/api/dividend/'.concat(id));
        this.$emit('reload');
      }
    }
  }
}
</script>
