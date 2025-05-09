// src/pages/ErrorPage.jsx
import { ERROR_PAGE_CLASSES } from "../utils/constants";

function ErrorPage() {
  return (
    <div className={ERROR_PAGE_CLASSES}>
      <h2 className="text-2xl font-bold mb-4">404 - Page Not Found</h2>
      <p className="text-gray-400">The page you are looking for does not exist. Please return to the <a href="/" className="text-blue-500 hover:underline">homepage</a>.</p>
    </div>
  );
}

export default ErrorPage;