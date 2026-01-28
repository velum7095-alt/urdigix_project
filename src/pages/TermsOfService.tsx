import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const TermsOfService = () => {
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
          <h1 className="text-4xl font-display font-bold mb-8">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using the URDIGIX website and services, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Services Description</h2>
              <p className="text-muted-foreground leading-relaxed">
                URDIGIX provides digital marketing services including but not limited to website development, social media management, video production, paid advertising, and email marketing. The specific scope of services will be outlined in individual service agreements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Client Responsibilities</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">As a client, you agree to:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Provide accurate and complete information</li>
                <li>Respond to communications in a timely manner</li>
                <li>Provide necessary assets and approvals as requested</li>
                <li>Pay for services according to agreed terms</li>
                <li>Not use our services for any unlawful purpose</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Payment Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                Payment terms will be specified in individual service agreements. Unless otherwise stated, invoices are due within 14 days of receipt. Late payments may incur additional fees and may result in suspension of services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                Upon full payment, clients receive ownership of the final deliverables created specifically for them. URDIGIX retains the right to use work samples in portfolios and marketing materials unless otherwise agreed in writing.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Confidentiality</h2>
              <p className="text-muted-foreground leading-relaxed">
                Both parties agree to keep confidential any proprietary information shared during the course of the engagement. This obligation survives the termination of the service agreement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                URDIGIX shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our services. Our total liability shall not exceed the amount paid for the specific service in question.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                Either party may terminate the service agreement with 30 days written notice. Upon termination, the client is responsible for payment for all work completed up to the termination date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Modifications</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting to our website. Your continued use of our services constitutes acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                For questions about these Terms of Service, please contact us at:
              </p>
              <p className="text-muted-foreground mt-2">
                Email: legal@urdigix.com<br />
                Website: urdigix.com
              </p>
            </section>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default TermsOfService;
