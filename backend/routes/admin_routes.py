from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId

import joblib
import bcrypt

from datetime import datetime, timezone

import shared

from auth import require_roles

from shared import (
    users_collection,
    patients_collection,
    audit_logs_collection,
    datasets_collection,
    system_settings_collection,
    SYSTEM_ADMIN_EMAIL,
    MODEL_PATH,
    create_audit_log,
    CreateAdminUser,
    UpdateRole,
    AssignPatient,
    DatasetInfo,
    SystemSetting,
)


router = APIRouter()


# =========================================================
# SYSTEM ADMIN - USERS
# =========================================================


@router.get("/api/admin/users")
def admin_get_users(
    current_user: dict = Depends(
        require_roles(
            "System Administrator"
        )
    ),
):

    users = list(
        users_collection.find(
            {},
            {
                "password": 0
            },
        )
    )

    users.append(
        {
            "_id": "system-admin",
            "name": "System Administrator",
            "email": SYSTEM_ADMIN_EMAIL,
            "role": "System Administrator",
            "protected": True,
        }
    )

    for user in users:

        if "_id" in user:
            user["_id"] = str(user["_id"])

        if user.get("created_at"):
            user["created_at"] = user[
                "created_at"
            ].isoformat()

    return users


# =========================================================
# SYSTEM ADMIN - CREATE USER
# =========================================================


@router.post("/api/admin/users")
def admin_create_user(
    user: CreateAdminUser,
    current_user: dict = Depends(
        require_roles(
            "System Administrator"
        )
    ),
):

    allowed_roles = {
        "Doctor",
        "Hospital Administrator",
        "Healthcare Researcher",
    }

    if user.role not in allowed_roles:

        raise HTTPException(
            status_code=400,
            detail=(
                "The configured System Administrator "
                "cannot be created or replaced here."
            ),
        )

    email = str(user.email).lower()

    if email == SYSTEM_ADMIN_EMAIL.lower():

        raise HTTPException(
            status_code=400,
            detail=(
                "This email belongs to the System Administrator."
            ),
        )

    if users_collection.find_one(
        {"email": email}
    ):

        raise HTTPException(
            status_code=400,
            detail="User already exists.",
        )

    hashed_password = bcrypt.hashpw(
        user.password.encode("utf-8"),
        bcrypt.gensalt(),
    )

    result = users_collection.insert_one(
        {
            "name": user.name,
            "email": email,
            "password": hashed_password.decode("utf-8"),
            "role": user.role,
            "created_at": datetime.now(timezone.utc),
        }
    )

    create_audit_log(
        current_user,
        "CREATE_USER",
        resource=str(result.inserted_id),
        details={
            "role": user.role
        },
    )

    return {
        "message": "User created successfully",
        "user_id": str(result.inserted_id),
    }


# =========================================================
# SYSTEM ADMIN - UPDATE ROLE
# =========================================================


@router.patch("/api/admin/users/{user_id}/role")
def admin_update_role(
    user_id: str,
    role_data: UpdateRole,
    current_user: dict = Depends(
        require_roles(
            "System Administrator"
        )
    ),
):

    allowed_roles = {
        "Doctor",
        "Hospital Administrator",
        "Healthcare Researcher",
    }

    if role_data.role not in allowed_roles:

        raise HTTPException(
            status_code=400,
            detail=(
                "System Administrator is a protected "
                "backend-configured account."
            ),
        )

    try:

        object_id = ObjectId(user_id)

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid user ID.",
        )

    user = users_collection.find_one(
        {
            "_id": object_id
        }
    )

    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    users_collection.update_one(
        {
            "_id": object_id
        },
        {
            "$set": {
                "role": role_data.role
            }
        },
    )

    create_audit_log(
        current_user,
        "UPDATE_USER_ROLE",
        resource=user_id,
        details={
            "new_role": role_data.role
        },
    )

    return {
        "message": "User role updated successfully"
    }


# =========================================================
# SYSTEM ADMIN - DELETE USER
# =========================================================


@router.delete("/api/admin/users/{user_id}")
def admin_delete_user(
    user_id: str,
    current_user: dict = Depends(
        require_roles(
            "System Administrator"
        )
    ),
):

    if user_id == "system-admin":

        raise HTTPException(
            status_code=400,
            detail=(
                "The System Administrator account "
                "cannot be deleted."
            ),
        )

    try:

        object_id = ObjectId(user_id)

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid user ID.",
        )

    result = users_collection.delete_one(
        {
            "_id": object_id
        }
    )

    if result.deleted_count == 0:

        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    create_audit_log(
        current_user,
        "DELETE_USER",
        resource=user_id,
    )

    return {
        "message": "User deleted successfully"
    }


# =========================================================
# SYSTEM ADMIN - ASSIGN PATIENT
# =========================================================


@router.patch("/api/admin/patients/{patient_id}/assign")
def assign_patient(
    patient_id: str,
    assignment: AssignPatient,
    current_user: dict = Depends(
        require_roles(
            "System Administrator"
        )
    ),
):

    try:

        patient_object_id = ObjectId(patient_id)

        doctor_object_id = ObjectId(
            assignment.doctor_id
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid patient or doctor ID.",
        )

    doctor = users_collection.find_one(
        {
            "_id": doctor_object_id,
            "role": "Doctor",
        }
    )

    if not doctor:

        raise HTTPException(
            status_code=404,
            detail="Doctor not found.",
        )

    patient = patients_collection.find_one(
        {
            "_id": patient_object_id
        }
    )

    if not patient:

        raise HTTPException(
            status_code=404,
            detail="Patient not found.",
        )

    patients_collection.update_one(
        {
            "_id": patient_object_id
        },
        {
            "$set": {
                "doctor_id": assignment.doctor_id
            }
        },
    )

    create_audit_log(
        current_user,
        "ASSIGN_PATIENT",
        resource=patient_id,
        details={
            "doctor_id": assignment.doctor_id
        },
    )

    return {
        "message": "Patient assigned successfully"
    }


# =========================================================
# SYSTEM ADMIN - AUDIT LOGS
# =========================================================


@router.get("/api/admin/audit-logs")
def get_audit_logs(
    current_user: dict = Depends(
        require_roles(
            "System Administrator"
        )
    ),
):

    logs = list(
        audit_logs_collection.find()
        .sort("created_at", -1)
        .limit(500)
    )

    for log in logs:

        if "_id" in log:
            log["_id"] = str(log["_id"])

        if log.get("created_at"):
            log["created_at"] = log[
                "created_at"
            ].isoformat()

    return logs


# =========================================================
# SYSTEM ADMIN - MODEL INFORMATION
# =========================================================


@router.get("/api/admin/model")
def admin_model_info(
    current_user: dict = Depends(
        require_roles(
            "System Administrator"
        )
    ),
):

    return {
        "model_path": MODEL_PATH,
        "model_loaded": True,
        "threshold": shared.READMISSION_THRESHOLD,
        "features": shared.MODEL_FEATURES,
    }


# =========================================================
# SYSTEM ADMIN - MODEL RELOAD
# =========================================================


@router.post("/api/admin/model/reload")
def admin_reload_model(
    current_user: dict = Depends(
        require_roles(
            "System Administrator"
        )
    ),
):

    try:

        model_package = joblib.load(
            MODEL_PATH
        )

        shared.readmission_model = (
            model_package["model"]
        )

        shared.READMISSION_THRESHOLD = (
            model_package["threshold"]
        )

        shared.MODEL_FEATURES = (
            model_package["features"]
        )

        create_audit_log(
            current_user,
            "MODEL_RELOAD",
        )

        return {
            "message": "ML model reloaded successfully.",
            "threshold": shared.READMISSION_THRESHOLD,
            "features": shared.MODEL_FEATURES,
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Model reload failed: {str(e)}",
        )


# =========================================================
# SYSTEM ADMIN - DATASETS
# =========================================================


@router.get("/api/admin/datasets")
def admin_get_datasets(
    current_user: dict = Depends(
        require_roles(
            "System Administrator"
        )
    ),
):

    datasets = list(
        datasets_collection.find()
    )

    for dataset in datasets:

        if "_id" in dataset:
            dataset["_id"] = str(dataset["_id"])

        if dataset.get("created_at"):
            dataset["created_at"] = dataset[
                "created_at"
            ].isoformat()

    return datasets


# =========================================================
# SYSTEM ADMIN - CREATE DATASET
# =========================================================


@router.post("/api/admin/datasets")
def admin_create_dataset(
    dataset: DatasetInfo,
    current_user: dict = Depends(
        require_roles(
            "System Administrator"
        )
    ),
):

    result = datasets_collection.insert_one(
        {
            "name": dataset.name,
            "description": dataset.description,
            "source": dataset.source,
            "created_at": datetime.now(timezone.utc),
        }
    )

    create_audit_log(
        current_user,
        "CREATE_DATASET",
        resource=str(result.inserted_id),
    )

    return {
        "message": "Dataset information created successfully.",
        "dataset_id": str(result.inserted_id),
    }


# =========================================================
# SYSTEM ADMIN - SETTINGS
# =========================================================


@router.get("/api/admin/settings")
def admin_get_settings(
    current_user: dict = Depends(
        require_roles(
            "System Administrator"
        )
    ),
):

    settings = list(
        system_settings_collection.find()
    )

    for setting in settings:

        if "_id" in setting:
            setting["_id"] = str(setting["_id"])

        if setting.get("updated_at"):
            setting["updated_at"] = setting[
                "updated_at"
            ].isoformat()

    return settings


# =========================================================
# SYSTEM ADMIN - UPDATE SETTING
# =========================================================


@router.patch("/api/admin/settings")
def admin_update_setting(
    setting: SystemSetting,
    current_user: dict = Depends(
        require_roles(
            "System Administrator"
        )
    ),
):

    system_settings_collection.update_one(
        {
            "key": setting.key
        },
        {
            "$set": {
                "key": setting.key,
                "value": setting.value,
                "updated_at": datetime.now(timezone.utc),
            }
        },
        upsert=True,
    )

    create_audit_log(
        current_user,
        "UPDATE_SYSTEM_SETTING",
        details={
            "key": setting.key
        },
    )

    return {
        "message": "System setting updated successfully."
    }