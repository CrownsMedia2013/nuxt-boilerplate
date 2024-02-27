import prismic from '@prismicio/client'
import sm from '../slicemachine.config.json'
import linkResolver from '../plugins/link-resolver'

export default async () => {
  const api = await prismic.getApi(sm.apiEndpoint)
  const settings = await api.getSingle('settings')
  const startPageUID = settings?.data.startPage?.uid
  const routes = []
  let page = 0
  let totalPages

  while (page !== totalPages) {
    page++

    const data = await api.query([
      prismic.predicates.has('my.page.uid'),
      prismic.predicates.at('my.page.exclude', false)
    ], { pageSize: 100, page })

    totalPages = Math.min(data.total_pages, 500)
    
    const documents = data?.results

    documents.forEach((doc) => {
      var lastmod = doc.last_publication_date
  
      if (doc.data.sections) {
        const sections = doc.data.sections?.filter((item) => item.section.last_publication_date)
        const lastmods = sections?.map((item) => item.section.last_publication_date) || []
        lastmods.push(lastmod)
        lastmod = lastmods.sort((date1, date2) => new Date(date2) - new Date(date1))[0]
      }
  
      routes.push({
        url: doc.uid === startPageUID ? '' : linkResolver(doc),
        lastmod
      })
    })
  }

  return routes
}