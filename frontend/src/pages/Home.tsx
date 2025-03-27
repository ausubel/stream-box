export default function Home() {

  return (
    <div className="space-y-8">
      <section className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Live Videos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Live videos will be populated here */}
          <div className="text-gray-500">No live videos at the moment</div>
        </div>
      </section>

      <section className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Recorded Videos</h2>
        <div className="space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full hover:bg-indigo-200">
              All
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200">
              Gaming
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200">
              Music
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200">
              Education
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Recorded videos will be populated here */}
            <div className="text-gray-500">No recorded videos found</div>
          </div>
        </div>
      </section>
    </div>
  );
}