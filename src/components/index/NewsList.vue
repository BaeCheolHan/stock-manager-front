<template>
  <div class="news-list">
    <div v-if="loading" class="pd-10">로딩중...</div>
    <div v-else-if="!items.length" class="pd-10">뉴스가 없습니다.</div>
    <div v-else>
      <div v-for="(n, i) in items" :key="i" class="news-item">
        <a :href="n.link" target="_blank" rel="noopener" class="title">{{ n.title }}</a>
        <div class="meta">
          <span class="source">{{ n.source || 'Google News' }}</span>
          <span class="time">· {{ n.publishedAt ? new Date(n.publishedAt).toLocaleString('ko-KR') : '' }}</span>
        </div>
        <div v-if="n.snippet" class="snippet">{{ n.snippet }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NewsList',
  props: { q: { type: String, required: true } },
  data() { return { loading: false, items: [] } },
  async created() {
    this.loading = true
    try {
      const { default: api } = await import('@/service/apiClient')
      const q = String(this.q || '').trim()
      const isAsciiTicker = /^[A-Z.]{1,12}$/.test(q)
      const lang = isAsciiTicker ? 'en' : 'ko'

      // 1) Aggregated search (primary: Google+Yahoo+국내 매체)
      let res = await api.get('/yfin/search', { params: { q, count: 50, lang: (lang==='en'?'en-US':'ko-KR'), region: (lang==='en'?'US':'KR') } }).catch(() => null)
      let items = (res?.data?.news || res?.data?.items) || []

      // 2) Google News (fallback)
      if (!items.length) {
        res = await api.get('/yfin/search/google', { params: { q, count: 50, lang } }).catch(() => null)
        items = res?.data?.items || []
      }

      // 3) Google News(대체 경로)
      if (!items.length) {
        res = await api.get('/yfin/news/google', { params: { q, count: 50, lang } }).catch(() => null)
        items = res?.data?.items || []
      }

      // 4) 마지막 시도: 언어 반대편으로 한 번 더
      if (!items.length) {
        const lang2 = lang === 'en' ? 'ko' : 'en'
        res = await api.get('/yfin/search/google', { params: { q, count: 20, lang: lang2 } }).catch(() => null)
        items = res?.data?.items || []
      }

      // 디듑(title+link) 후 정렬(최신 우선)
      const seen = new Set()
      const unique = []
      for (const x of items) {
        const key = `${x.title}::${x.link}`
        if (seen.has(key)) continue
        seen.add(key)
        unique.push(x)
      }
      unique.sort((a,b) => new Date(b.publishedAt||0) - new Date(a.publishedAt||0))

      this.items = unique.map(x => ({
        title: x.title, link: x.link, source: x.source, publishedAt: x.publishedAt, snippet: x.snippet
      }))
    } catch(_) {}
    this.loading = false
  }
}
</script>

<style scoped>
.news-item { padding: 10px 12px; border-bottom: 1px solid #eee; }
.title { font-weight: 700; color: #111; text-decoration: none; }
.title:hover { text-decoration: underline; }
.meta { color: #777; font-size: 12px; margin-top: 2px; }
.snippet { color: #444; font-size: 13px; margin-top: 6px; line-height: 1.3; }
</style>
