import { Navbar } from "@/components/Navbar"

export const SkeletonMine = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="flex-1 p-4">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>

        {/* Kategori filtreleri */}
        <div className="flex overflow-x-auto pb-2 mb-4 -mx-4 px-4">
          <div className="h-10 bg-gray-200 rounded-full w-20 mr-2 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded-full w-24 mr-2 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded-full w-28 mr-2 animate-pulse"></div>
        </div>

        {/* Kart listesi */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow overflow-hidden animate-pulse">
              <div className="h-32 bg-gray-200"></div>
              <div className="p-2">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Navbar />
    </div>
  )
}
