<template>
  <div class="searchSelect" @keydown.down.prevent="move(1)" @keydown.up.prevent="move(-1)" @keydown.enter.prevent="enter">
    <div class="input_reset">
      <input class="form-control" :placeholder="placeholder" v-model="keyword" @input="onInput" @focus="open = true" :aria-expanded="open ? 'true' : 'false'" role="combobox" aria-autocomplete="list" :aria-controls="listId" :enterkeyhint="enterKeyHint" autocomplete="off" autocapitalize="off" />
      <i class="ti-angle-down" @click="open = !open"></i>
    </div>
    <ul class="searchSelectBox" v-show="open" role="listbox" :id="listId">
      <li v-if="loading" v-for="n in 6" :key="'sk-'+n" class="skeleton">
        <v-skeleton-loader type="list-item-two-line"/>
      </li>
      <li v-else v-for="(item, idx) in filtered" :key="itemKey(item, idx)" :class="['result-item', {active: idx === activeIndex}]" @mousedown.prevent="select(item)" role="option" tabindex="0">
        <slot name="item" :item="item">
          <div class="item">
            <div class="text">
              <strong class="name" v-html="highlight(itemLabel(item))"/>
              <span class="meta"><span class="symbol">{{ (item.symbol || '') }}</span><span class="badge" v-if="item.code || item.national">{{ item.code || item.national }}</span></span>
            </div>
          </div>
        </slot>
      </li>
      <li v-if="!loading && filtered.length === 0" class="empty">검색 결과가 없습니다</li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'SearchSelect',
  props: {
    items: { type: Array, default: () => [] },
    label: { type: [String, Function], default: 'name' },
    keyField: { type: String, default: 'id' },
    placeholder: { type: String, default: '' },
    debounce: { type: Number, default: 250 },
    loading: { type: Boolean, default: false },
    enterKeyHint: { type: String, default: 'search' },
  },
  emits: ['select', 'input-change'],
  data() {
    return {
      keyword: '',
      open: false,
      filtered: [],
      activeIndex: -1,
      timer: null,
      listId: `ss-${Math.random().toString(36).slice(2)}`,
    }
  },
  watch: {
    items: {
      handler() { this.filterNow() },
      immediate: true,
    }
  },
  methods: {
    itemLabel(item) {
      if (typeof this.label === 'function') return this.label(item)
      return (item && item[this.label]) || ''
    },
    itemKey(item, idx) {
      return item[this.keyField] ?? this.itemLabel(item) ?? idx
    },
    onInput() {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.$emit('input-change', this.keyword)
        this.filterNow()
      }, this.debounce)
    },
    highlight(text) {
      const q = (this.keyword || '').toString().trim()
      if (!q) return text
      try {
        const esc = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const re = new RegExp(`(${esc})`, 'ig')
        return text.toString().replace(re, '<mark>$1</mark>')
      } catch(_) { return text }
    },
    filterNow() {
      const v = (this.keyword || '').toString().toLowerCase().replace(/\s+/g, '')
      this.filtered = this.items.filter(it => this.itemLabel(it).toString().toLowerCase().replace(/\s+/g, '').includes(v))
      this.activeIndex = this.filtered.length ? 0 : -1
    },
    select(item) {
      this.open = false
      this.$emit('select', item)
    },
    move(delta) {
      if (!this.open || this.filtered.length === 0) return
      const next = this.activeIndex + delta
      if (next < 0) this.activeIndex = this.filtered.length - 1
      else if (next >= this.filtered.length) this.activeIndex = 0
      else this.activeIndex = next
    },
    enter() {
      if (this.open && this.activeIndex >= 0) {
        this.select(this.filtered[this.activeIndex])
      }
    }
  }
}
</script>

<style scoped>
.active {
  background-color: #f1f1f1;
}
.searchSelectBox { max-height: 360px; overflow-y: auto; }
.result-item { padding: 8px 12px; cursor: pointer; }
.result-item:hover { background: #fafafa; }
.item { display: flex; align-items: center; gap: 8px; }
.text { display: flex; flex-direction: column; line-height: 1.2; }
.name { font-weight: 600; }
.meta { color: #888; font-size: 12px; margin-top: 2px; display: flex; gap: 6px; align-items: center; }
.badge { background: #f3f4f6; color: #666; padding: 1px 6px; border-radius: 10px; font-size: 11px; }
.empty { text-align: center; color: #888; padding: 10px; }
</style>
