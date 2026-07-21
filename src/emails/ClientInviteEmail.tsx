import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface ClientInviteEmailProps {
  clientName: string;
  inviteLink: string;
}

export const ClientInviteEmail = ({
  clientName,
  inviteLink,
}: ClientInviteEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to Aarotech - Access your Client Portal</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome to Aarotech!</Heading>
        <Text style={text}>Hi {clientName},</Text>
        <Text style={text}>
          We're thrilled to partner with you. We've set up a dedicated client portal for you to track projects, review deliverables, and manage invoices.
        </Text>
        <Section style={buttonContainer}>
          <Button style={button} href={inviteLink}>
            Access Client Portal
          </Button>
        </Section>
        <Text style={text}>
          If you have any questions, simply reply to this email!
        </Text>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  borderRadius: "5px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  padding: "0 40px",
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  padding: "0 40px",
};

const buttonContainer = {
  padding: "20px 40px",
};

const button = {
  backgroundColor: "#000000",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "100%",
  padding: "12px",
};

export default ClientInviteEmail;
