export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#F8FBFF] px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-5xl font-black">
          Privacy Policy
        </h1>

        <p className="mt-3 text-slate-500">
          Last Updated: June 2026
        </p>

        <div className="mt-10 space-y-6 text-slate-700 leading-8">
          <p>insai respects your privacy.</p>

          <h2 className="text-2xl font-bold">
            Information We Collect
          </h2>

          <ul className="list-disc pl-6">
            <li>Profile information</li>
            <li>Photos</li>
            <li>Messages</li>
            <li>Location information</li>
            <li>Device information</li>
          </ul>

          <h2 className="text-2xl font-bold">
            How We Use Information
          </h2>

          <ul className="list-disc pl-6">
            <li>Provide community services</li>
            <li>Provide matching services</li>
            <li>Improve user experience</li>
            <li>Prevent abuse</li>
          </ul>

          <p>
            Users may request deletion of their account at any time.
          </p>

          <p>
            Contact: insai.app@gmail.com
          </p>
        </div>
      </div>
    </main>
  );
}