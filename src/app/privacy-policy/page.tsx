export default function PrivacyPolicy() {
  return (
    <section>
      <h2>Privacy Policy (Short)</h2>
      <p>
        This project is a simple demonstration. It does not provide services,
        sell products, or collect personal data for any purpose.
      </p>

      <h3>Authentication</h3>
      <p>
        The site uses <strong>Google Sign‑In</strong> only to confirm that a
        visitor is signed in with a Google account for demonstration purposes.
        Authentication is handled by Google; this demo does not run a backend or
        database to store account data.
      </p>

      <h3>What we receive</h3>
      <p>
        When you sign in with Google the browser may receive an ID token or
        basic profile information (name, email, avatar) from {"Google's"} client
        library. This demo does not persist that information to a server or
        database — it is used only in the browser session to toggle visibility
        of demo content.
      </p>

      <h3>Data retention</h3>
      <p>
        No personal information is stored by this project. Any authentication
        tokens or profile data remain in the browser session and are cleared
        when you sign out, refresh, or close the page.
      </p>

      <h3>Third parties</h3>
      <p>
        Google is a third‑party identity provider. Their use of your data is
        governed by {"Google's"} privacy policies. This demo has no control over
        {"Google's"} policies or practices.
      </p>

      <h3>Children</h3>
      <p>
        This demo is not intended for children under 13 and does not knowingly
        collect data from minors.
      </p>
    </section>
  );
}
