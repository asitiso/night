import { createFileRoute } from "@tanstack/react-router";
import { EscapeApp } from "@/components/escape/EscapeApp";

export const Route = createFileRoute("/")({ component: EscapeApp });
