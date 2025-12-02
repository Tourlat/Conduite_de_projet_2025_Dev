import requests
import random
import time
from datetime import datetime, timedelta

BASE_URL = "http://localhost"  # Change the backend URL here

# ======== HTTP HELPERS =========


def post(url, data=None, headers=None):
    r = requests.post(url, json=data, headers=headers)
    r.raise_for_status()
    return r.json() if r.text else None


def get(url, headers=None):
    r = requests.get(url, headers=headers)
    r.raise_for_status()
    return r.json()


def put(url, data=None, headers=None):
    r = requests.put(url, json=data, headers=headers)
    r.raise_for_status()
    return r.json() if r.text else None


def delete(url, headers=None):
    r = requests.delete(url, headers=headers)
    if r.status_code not in (200, 204):
        r.raise_for_status()
    return True


# ======== AUTH =========

def register_user(email, password, name):
    url = f"{BASE_URL}/api/auth/register"
    return post(url, {"email": email, "password": password, "name": name})


def login_user(email, password):
    url = f"{BASE_URL}/api/auth/login"
    res = post(url, {"email": email, "password": password})
    return res["token"], res["id"], res["name"]


# ======== PROJECTS =========

def create_project(token, name, description, user_id, user_email):
    url = f"{BASE_URL}/api/projects"
    headers = {"Authorization": f"Bearer {token}"}

    data = {
        "name": name,
        "description": description,
        "user": {
            "id": user_id,
            "email": user_email,
        },
        "collaborateurs": []
    }

    return post(url, data, headers)


def add_collaborators(token, project_id, emails):
    url = f"{BASE_URL}/api/projects/{project_id}/collaborators"
    headers = {"Authorization": f"Bearer {token}"}
    return post(url, {"collaborators": emails}, headers)


# ======== ISSUES =========

def create_issue(token, project_id, title):
    url = f"{BASE_URL}/api/projects/{project_id}/issues"
    headers = {"Authorization": f"Bearer {token}"}

    data = {
        "title": title,
        "description": f"Description for {title}",
        "priority": random.choice(["LOW", "MEDIUM", "HIGH"]),
        "storyPoints": random.randint(1, 5),
        "status": "TODO",
        "assigneeId": None
    }

    return post(url, data, headers)


# ======== TASKS =========

def create_task(token, project_id, issue_id, title):
    url = f"{BASE_URL}/api/projects/{project_id}/issues/{issue_id}/tasks"
    headers = {"Authorization": f"Bearer {token}"}

    data = {
        "title": title,
        "description": f"Task for issue {issue_id}",
        "definitionOfDone": "Done when passes review",
        "status": random.choice(["TODO", "IN_PROGRESS"]),
        "assigneeId": None,
    }

    return post(url, data, headers)


# ======== TESTS =========

def create_test(token, project_id, issue_id):
    url = f"{BASE_URL}/api/projects/{project_id}/issues/{issue_id}/tests"
    headers = {"Authorization": f"Bearer {token}"}

    # Simple placeholder test code
    program_code = """
function add(a, b) {
  return a + b
}
""".strip()

    test_code = """
test("add(2, 3) devrait retourner 5", () => {
  assertEquals(add(2, 3), 5)
})
""".strip()

    data = {
        "programCode": program_code,
        "testCode": test_code
    }

    return post(url, data, headers)


# ======== DOCUMENTATION =========

def create_documentation(token, project_id, title):
    url = f"{BASE_URL}/api/projects/{project_id}/docs"
    headers = {"Authorization": f"Bearer {token}"}

    data = {
        "title": title,
        "content": f"{title} content"
    }

    return post(url, data, headers)


def link_doc_to_issue(doc_id, issue_id):
    url = f"{BASE_URL}/api/documentation-issues/documentation/{doc_id}/issue/{issue_id}"
    return post(url)


# ======== SPRINTS =========

def create_sprint(token, project_id):
    url = f"{BASE_URL}/api/projects/{project_id}/sprints"
    headers = {"Authorization": f"Bearer {token}"}

    start = datetime.utcnow()
    end = start + timedelta(days=14)

    data = {
        "name": f"Sprint-{random.randint(1, 100)}",
        "startDate": start.isoformat() + "Z",
        "endDate": end.isoformat() + "Z",
        "issueIds": []
    }

    return post(url, data, headers)


# ======== RELEASES =========

def create_release(token, project_id, issue_ids):
    url = f"{BASE_URL}/api/projects/{project_id}/releases"
    headers = {"Authorization": f"Bearer {token}"}

    data = {
        "version": {"major": 1, "minor": 0, "patch": random.randint(0, 10)},
        "releaseNotes": "Auto-generated release notes",
        "issueIds": issue_ids
    }

    return post(url, data, headers)


# ======== MAIN SEED LOGIC =========

def main():
    print("Registering and logging in users...")

    users = [
        ("alice@example.com", "password123", "Alice"),
        ("bob@example.com", "password123", "Bob"),
        ("carol@example.com", "password123", "Carol"),
    ]

    logged_in_users = {}

    for email, pwd, name in users:
        try:
            register_user(email, pwd, name)
        except:
            pass  # user may already exist

        token, uid, uname = login_user(email, pwd)
        logged_in_users[email] = {"token": token, "id": uid}
        print(f"Logged in: {email}")

    print("\nCreating projects...")
    alice = logged_in_users["alice@example.com"]
    bob = logged_in_users["bob@example.com"]
    alice_token = alice["token"]
    bob_token = bob["token"]

    project1 = create_project(alice_token, "Alpha Project",
                              "Test project Alpha", alice["id"], "alice@example.com")
    project2 = create_project(
        bob_token, "Beta Project", "Test project Beta", bob["id"], "bob@example.com")

    print(f"Created projects: {project1['id']} and {project2['id']}")

    add_collaborators(alice_token, project1["id"], [
                      "bob@example.com", "carol@example.com"])
    add_collaborators(bob_token, project2["id"], ["alice@example.com"])

    print("\nGenerating issues, tasks, tests, and documentation...")

    for project in [project1, project2]:
        token = alice_token if project == project1 else bob_token
        p_id = project["id"]

        issues = []

        for i in range(3):
            issue = create_issue(
                token, p_id, f"Issue {i+1} for {project['name']}")
            issues.append(issue)
            print(f"Created issue {issue['id']} in {project['name']}")

            # Create tasks
            for t in range(2):
                task = create_task(
                    token, p_id, issue["id"], f"Task {t+1} for issue {issue['id']}")
                print(f"  Created task {task['id']}")

            # Create exactly 1 test per issue (your request)
            test = create_test(token, p_id, issue["id"])
            print(f"  Created test {test['id']}")

        # Documentation
        doc = create_documentation(token, p_id, f"{project['name']} Docs")
        print(f"Created documentation {doc['id']}")

        link_doc_to_issue(doc["id"], issues[0]["id"])
        print("Linked documentation to issue")

        # Sprint
        sprint = create_sprint(token, p_id)
        print(f"Created sprint {sprint['id']}")

        # Release
        release = create_release(token, p_id, [i["id"] for i in issues])
        print(f"Created release {release['id']}")

    print("\n✔ Test data generation completed!")


if __name__ == "__main__":
    main()
