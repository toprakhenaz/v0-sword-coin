import ClientAuthCheck from "@/components/ClientAuthCheck"
import MainPage from "@/components/MainPage"

export default function Home() {
  return (
    <ClientAuthCheck>
      <MainPage />
    </ClientAuthCheck>
  )
}
