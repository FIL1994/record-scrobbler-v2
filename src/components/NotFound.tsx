import { Link } from "@tanstack/react-router";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "./starter-kit/Button";

export function NotFound() {
  return (
    <main className="flex-1 flex justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md mt-48">
        <h1 className="text-9xl font-bold text-red-600">404</h1>

        <div className="mt-8 space-y-6">
          <h2 className="text-3xl font-semibold text-gray-900">
            Page Not Found
          </h2>

          <p className="text-gray-600">
            Sorry, we couldn't find the page you're looking for. It might have
            been moved or doesn't exist.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button
              variant="primary"
              className="flex items-center justify-center gap-2"
              onPress={() => window.history.back()}
            >
              <ArrowLeft size={16} />
              <span>Go Back</span>
            </Button>

            <Link to="/" replace className="inline-block">
              <Button
                variant="secondary"
                className="flex items-center justify-center gap-2 w-full"
              >
                <Home size={16} />
                <span>Return Home</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
