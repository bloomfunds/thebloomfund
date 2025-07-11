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
  FileText,
  Shield,
  Users,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
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
              Terms of Service
            </h1>
            <p className="text-lg text-muted-foreground">
              Last updated: January 2024
            </p>
          </div>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl rounded-3xl">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">
                  Terms of Service Agreement
                </CardTitle>
                <CardDescription className="text-base">
                  Please read these terms carefully before using Bloom
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Quick Summary */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2 text-gray-900">
                    Quick Summary
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    By using Bloom, you agree to follow our community
                    guidelines, respect intellectual property rights, and
                    understand that we facilitate crowdfunding but don't
                    guarantee campaign success. Campaign creators are
                    responsible for delivering promised rewards.
                  </p>
                </div>
              </div>
            </div>

            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-8">
                {/* Section 1 */}
                <section>
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">1</span>
                    </div>
                    Acceptance of Terms
                  </h2>
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <p>
                      By accessing and using Bloom ("the Platform"), you accept
                      and agree to be bound by the terms and provision of this
                      agreement. If you do not agree to abide by the above,
                      please do not use this service.
                    </p>
                    <p>
                      These Terms of Service ("Terms") govern your use of our
                      website and services. We may update these terms from time
                      to time, and your continued use of the platform
                      constitutes acceptance of any changes.
                    </p>
                  </div>
                </section>

                <Separator />

                {/* Section 2 */}
                <section>
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">2</span>
                    </div>
                    Platform Description
                  </h2>
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <p>
                      Bloom is a crowdfunding platform that connects
                      entrepreneurs with supporters to fund business ideas and
                      projects. We provide the technology and infrastructure to
                      facilitate these connections but do not participate in the
                      actual funding transactions.
                    </p>
                    <p>Our platform allows users to:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Create and manage fundraising campaigns</li>
                      <li>Discover and support business projects</li>
                      <li>Communicate with campaign creators and supporters</li>
                      <li>
                        Process secure payments through third-party providers
                      </li>
                    </ul>
                  </div>
                </section>

                <Separator />

                {/* Section 3 */}
                <section>
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">3</span>
                    </div>
                    User Responsibilities
                  </h2>
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <h3 className="text-lg font-semibold">Campaign Creators</h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>
                        Provide accurate and truthful information about your
                        project
                      </li>
                      <li>
                        Deliver promised rewards to backers in a timely manner
                      </li>
                      <li>Maintain regular communication with supporters</li>
                      <li>Use funds raised for the stated project purposes</li>
                      <li>Comply with all applicable laws and regulations</li>
                    </ul>

                    <h3 className="text-lg font-semibold mt-6">
                      Supporters/Backers
                    </h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>
                        Understand that backing a project is not a purchase or
                        investment
                      </li>
                      <li>Research projects thoroughly before contributing</li>
                      <li>
                        Respect campaign creators and other community members
                      </li>
                      <li>Provide accurate payment information</li>
                    </ul>
                  </div>
                </section>

                <Separator />

                {/* Section 4 */}
                <section>
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">4</span>
                    </div>
                    Fees and Payments
                  </h2>
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <p>
                      Bloom charges a platform fee of 5% plus $0.30 per
                      successful transaction. Additional payment processing fees
                      may apply through our third-party payment providers.
                    </p>
                    <p>
                      Fees are only charged on successfully funded campaigns.
                      There are no upfront costs or monthly subscription fees
                      for using the platform.
                    </p>
                    <p>
                      All payments are processed securely through our trusted
                      payment partners. We do not store credit card information
                      on our servers.
                    </p>
                  </div>
                </section>

                <Separator />

                {/* Section 5 */}
                <section>
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">5</span>
                    </div>
                    Intellectual Property
                  </h2>
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <p>
                      You retain ownership of all intellectual property rights
                      in the content you create and post on Bloom. By posting
                      content, you grant us a non-exclusive, worldwide license
                      to use, display, and distribute your content on the
                      platform.
                    </p>
                    <p>
                      You must not post content that infringes on the
                      intellectual property rights of others. We will respond to
                      valid copyright infringement notices in accordance with
                      applicable law.
                    </p>
                  </div>
                </section>

                <Separator />

                {/* Section 6 */}
                <section>
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">6</span>
                    </div>
                    Prohibited Activities
                  </h2>
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <p>
                      The following activities are strictly prohibited on Bloom:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Fraudulent or misleading campaigns</li>
                      <li>Campaigns for illegal activities or products</li>
                      <li>Harassment or abuse of other users</li>
                      <li>Spam or unsolicited communications</li>
                      <li>Attempts to circumvent platform fees</li>
                      <li>Violation of intellectual property rights</li>
                      <li>Money laundering or other financial crimes</li>
                    </ul>
                  </div>
                </section>

                <Separator />

                {/* Section 7 */}
                <section>
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">7</span>
                    </div>
                    Disclaimers and Limitations
                  </h2>
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <p>
                      Bloom provides the platform "as is" without warranties of
                      any kind. We do not guarantee the success of any campaign
                      or the delivery of rewards by campaign creators.
                    </p>
                    <p>
                      We are not responsible for disputes between campaign
                      creators and backers, though we may provide assistance in
                      resolving conflicts when possible.
                    </p>
                    <p>
                      Our liability is limited to the maximum extent permitted
                      by law. In no event shall our liability exceed the fees
                      paid by you to use the platform.
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
                    Termination
                  </h2>
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <p>
                      We reserve the right to suspend or terminate your account
                      at any time for violation of these terms or for any other
                      reason we deem necessary to protect the platform and its
                      users.
                    </p>
                    <p>
                      You may terminate your account at any time by contacting
                      our support team. Upon termination, your access to the
                      platform will be revoked, but these terms will continue to
                      apply to any prior use of the service.
                    </p>
                  </div>
                </section>

                <Separator />

                {/* Section 9 */}
                <section>
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">9</span>
                    </div>
                    Contact Information
                  </h2>
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <p>
                      If you have any questions about these Terms of Service,
                      please contact us:
                    </p>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p>
                        <strong>Email:</strong> legal@bloom.com
                      </p>
                      <p>
                        <strong>Address:</strong> 123 Innovation Drive, San
                        Francisco, CA 94105
                      </p>
                      <p>

                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </ScrollArea>

            {/* Footer Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
              <Button className="premium-button flex-1" asChild>
                <Link href="/auth/signup">
                  <Users className="w-4 h-4 mr-2" />I Agree - Create Account
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
