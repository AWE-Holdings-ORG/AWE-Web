# SCRYPT-CROWN-003 — Crown Identity Terminal PCK Visibility

Status: ACTIVE
Version: 1.0
System: Crown Identity Terminal
Owner: AWE / Echo X Labs

## Purpose
Reduce avoidable Crown sign-in failures caused by mistyped PCK input while preserving masked-by-default credential handling.

## Canonical UX
- PCK is masked by default.
- The sign-in terminal provides an explicit SHOW control beside the PCK field.
- SHOW changes only the local presentation of the currently typed PCK.
- When visible, the control becomes HIDE.
- The control exposes its state through aria-pressed and an accessible label.
- Resetting/reopening the Crown terminal returns the PCK field to masked state.

## Security Boundary
The visibility control:
- does not store the PCK
- does not log the PCK
- does not send the PCK anywhere except the existing authentication request after the member submits
- does not alter hashing, authentication, session, or Crown authorization behavior
- does not make visibility persistent across terminal resets

## Input Reliability
The PCK field disables autocapitalization, autocorrect, and spellcheck so device/browser text assistance does not intentionally transform credential input.

## Rationale
Masked input can hide typing mistakes, especially when a physical keyboard has unreliable keys. A user-controlled visibility check lets the member confirm what was actually entered before submission.

## Implementation Map
- Markup: public/index.html
- Styling: public/styles.css
- Behavior: public/script.js
