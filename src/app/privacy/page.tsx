import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  Shield,
  Eye,
  Lock,
  Database,
  Users,
  Mail,
} from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-green-50/20 to-background pt-20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          <div>
            <h1 className="text-4xl font-bold gradient-text-hero">
              Privacy Policy
            </h1>
            <p className="text-lg text-muted-foreground">
              Last updated: January 2024
            </p>
          </div>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl rounded-3xl">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">
                  Privacy Policy
                </CardTitle>
                <CardDescription className="text-base">
                  How we collect, use, and protect your personal information
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Quick Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2 text-gray-900">
                    Privacy at a Glance
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    We collect only the information necessary to provide our
                    crowdfunding services. We never sell your personal data to
                    third parties and use industry-standard security measures to
                    protect your information. You have full control over your
                    data and can request deletion at any time.
                  </p>
                </div>
              </div>
            </div>

            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-8">
                {/* Section 1 */}
                <section>
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">1</span>
                    </div>
                    Information We Collect
                  </h2>
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <h3 className="text-lg font-semibold">
                      Personal Information
                    </h3>
                    <p>
                      When you create an account or use our services, we may
                      collect:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Name and email address</li>
                      <li>Profile information and photos</li>
                      <li>
                        Payment information (processed securely by third
                        parties)
                      </li>
                      <li>Communication preferences</li>
                      <li>Campaign and project information</li>
                    </ul>

                    <h3 className="text-lg font-semibold mt-6">
                      Automatically Collected Information
                    </h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>IP address and device information</li>
                      <li>Browser type and version</li>
                      <li>Usage patterns and preferences</li>
                      <li>Cookies and similar tracking technologies</li>
                    </ul>
                  </div>
                </section>

                <Separator />

                {/* Section 2 */}
                <section>
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">2</span>
                    </div>
                    How We Use Your Information
                  </h2>
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <p>We use your information to:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Provide and improve our crowdfunding platform</li>
                      <li>Process payments and transactions</li>
                      <li>
                        Communicate with you about your account and campaigns
                      </li>
                      <li>Send important updates and notifications</li>
                      <li>Prevent fraud and ensure platform security</li>
                      <li>Analyze usage patterns to improve our services</li>
                      <li>Comply with legal obligations</li>
                    </ul>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                      <p className="text-yellow-800">
                        <strong>Marketing Communications:</strong> We will only
                        send you marketing emails if you explicitly opt-in. You
                        can unsubscribe at any time.
                      </p>
                    </div>
                  </div>
                </section>

                <Separator />

                {/* Section 3 */}
                <section>
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">3</span>
                    </div>
                    Information Sharing
                  </h2>
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <p>
                      We do not sell, trade, or rent your personal information
                      to third parties. We may share your information only in
                      the following circumstances:
                    </p>

                    <h3 className="text-lg font-semibold">Service Providers</h3>
                    <p>
                      We work with trusted third-party service providers who
                      help us operate our platform, including:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Payment processors (Stripe, PayPal)</li>
                      <li>Email service providers</li>
                      <li>Cloud hosting services</li>
                      <li>Analytics providers</li>
                    </ul>

                    <h3 className="text-lg font-semibold mt-6">
                      Legal Requirements
                    </h3>
                    <p>
                      We may disclose your information if required by law, court
                      order, or government request, or to protect our rights and
                      the safety of our users.
                    </p>

                    <h3 className="text-lg font-semibold mt-6">
                      Business Transfers
                    </h3>
                    <p>
                      In the event of a merger, acquisition, or sale of assets,
                      your information may be transferred as part of the
                      business transaction.
                    </p>
                  </div>
                </section>

                <Separator />

                {/* Section 4 */}
                <section>
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Lock className="w-4 h-4 text-white" />
                    </div>
                    Data Security
                  </h2>
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <p>
                      We implement industry-standard security measures to
                      protect your personal information:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>SSL/TLS encryption for data transmission</li>
                      <li>Secure data storage with encryption at rest</li>
                      <li>Regular security audits and monitoring</li>
                      <li>Access controls and authentication measures</li>
                      <li>Employee training on data protection</li>
                    </ul>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                      <p className="text-green-800">
                        <strong>Payment Security:</strong> We never store your
                        credit card information. All payment data is processed
                        securely by our PCI-compliant payment partners.
                      </p>
                    </div>
                  </div>
                </section>

                <Separator />

                {/* Section 5 */}
                <section>
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    Your Rights and Choices
                  </h2>
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <p>
                      You have the following rights regarding your personal
                      information:
                    </p>

                    <h3 className="text-lg font-semibold">
                      Access and Portability
                    </h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Request a copy of your personal data</li>
                      <li>Export your data in a portable format</li>
                    </ul>

                    <h3 className="text-lg font-semibold mt-4">
                      Correction and Updates
                    </h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Update your profile information at any time</li>
                      <li>Correct inaccurate personal information</li>
                    </ul>

                    <h3 className="text-lg font-semibold mt-4">Deletion</h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>
                        Request deletion of your account and personal data
                      </li>
                      <li>
                        Note: Some information may be retained for legal
                        compliance
                      </li>
                    </ul>

                    <h3 className="text-lg font-semibold mt-4">
                      Communication Preferences
                    </h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Opt-out of marketing communications</li>
                      <li>Manage notification preferences</li>
                    </ul>
                  </div>
                </section>

                <Separator />

                {/* Section 6 */}
                <section>
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-600 rounded-lg flex items-center justify-center">
                      <Database className="w-4 h-4 text-white" />
                    </div>
                    Data Retention
                  </h2>
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <p>
                      We retain your personal information only as long as
                      necessary to provide our services and comply with legal
                      obligations:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Account information: Until account deletion</li>
                      <li>
                        Transaction records: 7 years for tax and legal
                        compliance
                      </li>
                      <li>Communication logs: 3 years for customer service</li>
                      <li>Analytics data: Anonymized after 2 years</li>
                    </ul>

                    <p>
                      When you delete your account, we will remove your personal
                      information within 30 days, except where retention is
                      required by law.
                    </p>
                  </div>
                </section>

                <Separator />

                {/* Section 7 */}
                <section>
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">7</span>
                    </div>
                    Cookies and Tracking
                  </h2>
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <p>
                      We use cookies and similar technologies to improve your
                      experience:
                    </p>

                    <h3 className="text-lg font-semibold">Essential Cookies</h3>
                    <p>
                      Required for basic platform functionality and security.
                    </p>

                    <h3 className="text-lg font-semibold mt-4">
                      Analytics Cookies
                    </h3>
                    <p>
                      Help us understand how users interact with our platform.
                    </p>

                    <h3 className="text-lg font-semibold mt-4">
                      Preference Cookies
                    </h3>
                    <p>Remember your settings and preferences.</p>

                    <p className="mt-4">
                      You can control cookies through your browser settings, but
                      disabling certain cookies may affect platform
                      functionality.
                    </p>
                  </div>
                </section>

                <Separator />

                {/* Section 8 */}
                <section>
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-gray-500 to-slate-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">8</span>
                    </div>
                    International Data Transfers
                  </h2>
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <p>
                      Bloom operates globally, and your information may be
                      transferred to and processed in countries other than your
                      own. We ensure appropriate safeguards are in place for
                      international data transfers.
                    </p>
                    <p>
                      For users in the European Union, we comply with GDPR
                      requirements and use approved transfer mechanisms such as
                      Standard Contractual Clauses.
                    </p>
                  </div>
                </section>

                <Separator />

                {/* Section 9 */}
                <section>
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <Mail className="w-4 h-4 text-white" />
                    </div>
                    Contact Us
                  </h2>
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <p>
                      If you have any questions about this Privacy Policy or
                      want to exercise your privacy rights, please contact us:
                    </p>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p>
                        <strong>Privacy Officer:</strong> privacy@bloom.com
                      </p>
                      <p>
                        <strong>General Support:</strong> support@bloom.com
                      </p>
                      <p>
                        <strong>Address:</strong> 123 Innovation Drive, San
                        Francisco, CA 94105
                      </p>
                      <p>

                      </p>
                    </div>

                    <p>
                      We will respond to your privacy-related requests within 30
                      days.
                    </p>
                  </div>
                </section>
              </div>
            </ScrollArea>

            {/* Footer Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
              <Button className="premium-button flex-1" asChild>
                <Link href="/auth/signup">
                  <Shield className="w-4 h-4 mr-2" />I Understand - Create
                  Account
                </Link>
              </Button>
              <Button variant="outline" className="flex-1" asChild>
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
