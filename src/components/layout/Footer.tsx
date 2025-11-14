export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h3 className="font-semibold">Product</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>Assessment Tool</li>
              <li>Lien Kits</li>
              <li>Online Forms</li>
              <li>Legal Support</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold">Resources</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>Documentation</li>
              <li>Guides</li>
              <li>FAQ</li>
              <li>Support</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold">Company</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>About</li>
              <li>Contact</li>
              <li>Privacy</li>
              <li>Terms</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold">Legal</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>Lovein Ribman P.C.</li>
              <li>Texas Law Firm</li>
              <li>Licensed Attorneys</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Lien Professor by Lovein Ribman P.C. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
