from fastapi.testclient import TestClient

from src import app as app_module

client = TestClient(app_module.app)


def test_student_can_be_removed_from_activity():
    activity_name = "Chess Club"
    email = "remove-me@mergington.edu"

    app_module.activities[activity_name]["participants"].append(email)

    response = client.delete(f"/activities/{activity_name}/signup?email={email}")

    assert response.status_code == 200
    assert response.json()["message"] == f"Removed {email} from {activity_name}"
    assert email not in app_module.activities[activity_name]["participants"]
