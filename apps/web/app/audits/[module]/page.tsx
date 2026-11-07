import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auditModules, loadAudit } from "../../lib/audits";
import AuditWorkspace from "./AuditWorkspace";

type Params = Promise<{ module: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return auditModules().map((module) => ({ module }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { module } = await params;
  return { title: `${module} audit — krule` };
}

export default async function AuditPage({ params }: { params: Params }) {
  const { module } = await params;
  const audit = await loadAudit(module);
  if (!audit) notFound();

  return <AuditWorkspace audit={audit} />;
}
