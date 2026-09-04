import { Link } from 'react-router-dom'
import { ShieldX } from 'lucide-react'

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-red-100 rounded-full">
            <ShieldX className="w-16 h-16 text-red-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-8">
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>
        <Link
          to="/dashboard"
          className="btn-primary inline-block"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  )
}

export default Unauthorized
