export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-9 w-64 bg-gray-200 rounded" />
          <div className="h-5 w-96 bg-gray-200 rounded mt-2" />
        </div>
        <div className="h-10 w-48 bg-gray-200 rounded" />
      </div>
      <div className="h-96 bg-gray-200 rounded" />
    </div>
  )
}
