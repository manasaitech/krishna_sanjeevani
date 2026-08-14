import logging

logger = logging.getLogger("performance_test")

def subscribe_user(user, plan_id="premium"):
    """Subscribes the user to standard or premium plan using the mock verification flow."""
    # 1. Fetch plans first (realistic flow)
    with user.get_api("/subscriptions/plans", catch_response=True, name="Subscriptions: Get Plans") as response:
        if response.status_code == 200:
            response.success()
        else:
            response.failure(f"Get subscription plans failed with code {response.status_code}")
            return False

    # 2. Create Order
    order_payload = {
        "planId": plan_id
    }
    order_id = None
    payment_id = None
    
    with user.post_api("/subscriptions/create-order", json=order_payload, catch_response=True, name="Subscriptions: Create Order") as response:
        if response.status_code == 200:
            data = response.json().get("data", {})
            order_id = data.get("orderId")
            payment_id = data.get("paymentId")
            response.success()
        else:
            response.failure(f"Create order failed with code {response.status_code}: {response.text}")
            return False

    if not order_id:
        return False

    # 3. Verify Payment order (utilizing backend mock verification mode)
    verify_payload = {
        "orderId": order_id,
        "paymentId": payment_id,
        "signature": "mock_success"
    }
    
    with user.post_api("/subscriptions/verify", json=verify_payload, catch_response=True, name="Subscriptions: Verify Payment") as response:
        if response.status_code == 200:
            response.success()
            # Successfully upgraded in backend, let's verify profile reflects it
            user.get_api("/auth/me", name="Subscriptions: Verify Upgraded Profile")
            return True
        else:
            response.failure(f"Payment verification failed with code {response.status_code}: {response.text}")
            return False
