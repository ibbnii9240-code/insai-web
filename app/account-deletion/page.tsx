export default function AccountDeletionPage() {
  return (
    <main className="min-h-screen bg-[#F8FBFF] px-6 py-24 text-slate-900">
      <div className="mx-auto max-w-4xl">
        <p className="font-black text-sky-500">Account Deletion</p>

        <h1 className="mt-4 text-5xl font-black">
          insai Account Deletion Request
        </h1>

        <div className="mt-10 space-y-8 rounded-[36px] bg-white p-10 leading-8 text-slate-700 shadow-xl shadow-sky-100">
          <section>
            <h2 className="text-2xl font-black text-slate-900">
              Account and Data Deletion
            </h2>
            <p className="mt-4">
              Users may request deletion of their insai account and associated
              personal data at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900">
              How to Request Deletion
            </h2>
            <p className="mt-4">Send an email to:</p>
            <p className="mt-2 font-bold text-violet-500">
              ibbnii9240@gmail.com
            </p>

            <p className="mt-6">Subject:</p>
            <div className="mt-2 rounded-2xl bg-slate-50 p-4 font-bold">
              Account Deletion Request
            </div>

            <p className="mt-6">Please include:</p>
            <ul className="mt-4 list-disc space-y-2 pl-6">
              <li>Your insai nickname</li>
              <li>Registered email address, if applicable</li>
              <li>A brief request for account deletion</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900">
              What Data Will Be Deleted
            </h2>
            <p className="mt-4">
              Upon successful verification, the following data will be
              permanently deleted:
            </p>

            <ul className="mt-4 list-disc space-y-2 pl-6">
              <li>User profile information</li>
              <li>Profile photos</li>
              <li>Posts and uploaded content</li>
              <li>Chat messages</li>
              <li>Matching history</li>
              <li>Friend/follow relationships</li>
              <li>Account preferences</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900">
              Data Retention
            </h2>
            <p className="mt-4">
              Certain information may be retained for a limited period where
              required for fraud prevention, abuse investigations, legal
              compliance, or security purposes.
            </p>
            <p className="mt-4">
              Such retained information will be deleted within{" "}
              <strong>30 days</strong> after account deletion unless a longer
              retention period is legally required.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900">
              Processing Time
            </h2>
            <p className="mt-4">
              Account deletion requests are typically processed within{" "}
              <strong>7 business days</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900">
              Contact
            </h2>
            <p className="mt-4">
              For questions regarding account deletion or privacy:
            </p>
            <p className="mt-2 font-bold text-violet-500">
              ibbnii9240@gmail.com
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}