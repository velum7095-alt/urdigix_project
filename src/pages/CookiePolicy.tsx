import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container flex items-center h-16 px-6">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <main className="container px-6 py-16 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-display font-bold mb-8">Cookie Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. What Are Cookies</h2>
              <p className="text-muted-foreground leading-relaxed">
                Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. How We Use Cookies</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">URDIGIX uses cookies for the following purposes:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li><strong>Essential Cookies:</strong> Required for the website to function properly</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website</li>
                <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
                <li><strong>Marketing Cookies:</strong> Track your activity to deliver relevant advertising</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Types of Cookies We Use</h2>
              
              <h3 className="text-xl font-medium mb-3 mt-6">Essential Cookies</h3>
              <p className="text-muted-foreground leading-relaxed">
                These cookies are necessary for the website to function and cannot be switched off. They are usually only set in response to actions made by you, such as setting your privacy preferences or filling in forms.
              </p>

              <h3 className="text-xl font-medium mb-3 mt-6">Analytics Cookies</h3>
              <p className="text-muted-foreground leading-relaxed">
                These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us know which pages are the most and least popular and see how visitors move around the site.
              </p>

              <h3 className="text-xl font-medium mb-3 mt-6">Functional Cookies</h3>
              <p className="text-muted-foreground leading-relaxed">
                These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third-party providers whose services we have added to our pages.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Third-Party Cookies</h2>
              <p className="text-muted-foreground leading-relaxed">
                Some cookies are placed by third-party services that appear on our pages. We do not control these third-party cookies. Please refer to the relevant third party's website for more information about their cookies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Managing Cookies</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You can control and manage cookies in various ways. Please note that removing or blocking cookies may impact your user experience and some functionality may no longer be available.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Most browsers allow you to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-2">
                <li>View what cookies are stored and delete them individually</li>
                <li>Block third-party cookies</li>
                <li>Block cookies from specific sites</li>
                <li>Block all cookies from being set</li>
                <li>Delete all cookies when you close your browser</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Cookie Retention</h2>
              <p className="text-muted-foreground leading-relaxed">
                The length of time a cookie remains on your device depends on whether it is a "persistent" or "session" cookie. Session cookies are deleted when you close your browser, while persistent cookies remain until they expire or are deleted.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Updates to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or our data practices. When we make changes, we will update the "Last updated" date at the top of this policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about our use of cookies, please contact us at:
              </p>
              <p className="text-muted-foreground mt-2">
                Email: privacy@urdigix.com<br />
                Website: urdigix.com
              </p>
            </section>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default CookiePolicy;
