import Layout from "@/app/layout"
import TopicSelection from "@/components/topic-selection-component"
import Sidebar from "@/components/sidebar"

export default function Home() {
  return (
    <Layout>
      <Sidebar></Sidebar>
      <TopicSelection />
    </Layout>
  )
}