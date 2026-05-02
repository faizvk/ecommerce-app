// Used by route guards (ProtectedRoute, GuestRoute, AdminProtectedRoute) while
// the auth slice is restoring the session. Matches the rest of the app's loaders.
export default function RouteLoader() {
  return (
    <div className="flex justify-center items-center py-32">
      <div className="animate-spin w-12 h-12 rounded-full border-4 border-brand-medium border-t-brand" />
    </div>
  );
}
