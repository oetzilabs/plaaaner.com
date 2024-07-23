// @ts-nocheck
import React from "react";
import { Img, Row, Html, Link, Body, Head, Button, Column, Preview, Section, Container } from "@jsx-email/all";
import { Hr, Text, Fonts, SplitString } from "../components";
import {
  unit,
  body,
  frame,
  heading,
  container,
  headingHr,
  footerLink,
  breadcrumb,
  compactText,
  buttonPrimary,
  breadcrumbColonSeparator,
} from "../styles";

// const LOCAL_ASSETS_URL = import.meta.resolve("./static/");
const LOCAL_ASSETS_URL = "http://localhost:3000/assets/email";

interface InviteEmailProps {
  workspace: string;
  assetsUrl: string;
  consoleUrl: string;
}
export const InviteEmail = ({
  workspace = "seed",
  assetsUrl = LOCAL_ASSETS_URL,
  consoleUrl = "https://console.sst.dev",
}: InviteEmailProps) => {
  const subject = `Join the ${workspace} workspace`;
  const messagePlain = `You've been invited to join the ${workspace} workspace in the SST Console.`;
  const url = `${consoleUrl}/${workspace}`;
  return (
    <Html lang="en">
      <Head>
        <title>{`Northstar Portal — ${messagePlain}`}</title>
      </Head>
      <Fonts assetsUrl={assetsUrl} />
      <Preview>{messagePlain}</Preview>
      <Body style={body} id={Math.random().toString()}>
        <Container style={container}>
          <Section style={frame}>
            <Row>
              <Column>
                <a href={consoleUrl}>
                  <Img height="32" alt="Northstar Logo" src={`${assetsUrl}/northstar-logo.png`} />
                </a>
              </Column>
              <Column align="right">
                <Button style={buttonPrimary} href={url}>
                  <span>Join Company</span>
                </Button>
              </Column>
            </Row>

            <Row style={headingHr}>
              <Column>
                <Hr />
              </Column>
            </Row>

            <Section>
              <Text style={{ ...compactText, ...breadcrumb }}>
                <span>SST</span>
                <span style={{ ...breadcrumbColonSeparator }}>:</span>
                <span>{workspace}</span>
              </Text>
              <Text style={{ ...heading, ...compactText }}>
                <Link href={url}>
                  <SplitString text={subject} split={40} />
                </Link>
              </Text>
            </Section>
            <Section style={{ padding: `${unit}px 0 0 0` }}>
              <Text style={{ ...compactText }}>
                You've been invited to join the <Link href={url}>{workspace}</Link> company in the{" "}
                <Link href={consoleUrl}>Northstar Portal</Link>.
              </Text>
            </Section>

            <Row style={headingHr}>
              <Column>
                <Hr />
              </Column>
            </Row>

            <Row>
              <Column>
                <Link href={consoleUrl} style={footerLink}>
                  Northstar Portal
                </Link>
              </Column>
              <Column align="right">
                <Link style={footerLink} href="https://northstar.com">
                  About
                </Link>
              </Column>
            </Row>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default InviteEmail;
