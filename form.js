/* Send the contact and visit forms without leaving the page.
 *
 * Formspree only honours a redirect on its paid plans, so on the free one
 * every visitor lands on formspree.io, in whatever language their browser
 * asks for. Posting in the background keeps them here, and the redirect
 * afterwards is ours to make — one thank-you page per language.
 *
 * The hidden _next field names that page, so it is also what marks a form as
 * ours to take over. Without JavaScript the form still submits the ordinary
 * way. The message arrives either way; only the page afterwards differs. */
document.querySelectorAll('input[name="_next"]').forEach((next) => {
  const form = next.form;
  if (!form) return;

  const button = form.querySelector('[type="submit"]');
  if (!button) return;

  const error = document.createElement("p");
  error.className = "form-error";
  error.hidden = true;
  error.setAttribute("role", "alert");
  form.insertBefore(error, button);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const label = button.textContent;
    button.disabled = true;
    button.textContent = form.dataset.sending || label;
    error.hidden = true;

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        window.location.assign(next.value);
        return;
      }

      // Formspree said no — a validation problem, or the form is disabled.
      error.textContent = form.dataset.error || "";
      error.hidden = false;
      button.disabled = false;
      button.textContent = label;
    } catch {
      // The network failed us, not Formspree. Fall back to the plain post so
      // the message still gets there, even if the page afterwards is theirs.
      form.submit();
    }
  });
});
