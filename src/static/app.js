document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const participants = details.participants || [];
        const spotsLeft = details.max_participants - participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-section">
            <strong>Participants:</strong>
            <ul>
              ${participants.length
                ? participants.map((email) => `
                  <li class="participant-item">
                    <span>${email}</span>
                    <button type="button" class="remove-participant" data-activity="${name}" data-email="${email}" aria-label="Remove ${email} from ${name}" title="Remove participant">✕</button>
                  </li>
                `).join("")
                : "<li class='participant-empty'>No participants yet</li>"}
            </ul>
          </div>
        `;

        activityCard.querySelectorAll(".remove-participant").forEach((button) => {
          button.addEventListener("click", async () => {
            const activityName = button.dataset.activity;
            const participantEmail = button.dataset.email;

            try {
              const result = await fetch(
                `/activities/${encodeURIComponent(activityName)}/signup?email=${encodeURIComponent(participantEmail)}`,
                { method: "DELETE" }
              );

              const data = await result.json();

              if (!result.ok) {
                throw new Error(data.detail || "Failed to remove participant");
              }

              messageDiv.textContent = data.message;
              messageDiv.className = "success";
              messageDiv.classList.remove("hidden");
              setTimeout(() => messageDiv.classList.add("hidden"), 5000);
              await fetchActivities();
            } catch (error) {
              messageDiv.textContent = error.message || "Failed to remove participant.";
              messageDiv.className = "error";
              messageDiv.classList.remove("hidden");
            }
          });
        });

        activitiesList.appendChild(activityCard);

        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        await fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
