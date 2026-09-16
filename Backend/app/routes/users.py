from typing import List, Optional
from pydantic import BaseModel, EmailStr
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.user import UserResponse, UserUpdate, UserCreate
from app.services.user_service import UserService
from app.services.audit_service import AuditService
from app.dependencies import RoleChecker, get_current_user
from app.utils.security import get_password_hash
from app.database import users_collection
from bson import ObjectId

router = APIRouter(prefix="/users", tags=["SysAdmin Member Management"])

sysadmin_dependency = Depends(RoleChecker(allowed_roles=["SysAdmin"]))

class StatusUpdateRequest(BaseModel):
    is_active: bool

class PasswordResetRequest(BaseModel):
    new_password: str

@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED, dependencies=[sysadmin_dependency])
def create_member(user_in: UserCreate, current_user: dict = Depends(get_current_user)):
    """
    Creates a new member account (SysAdmin only). Allows creating Doctor, Researcher, Admin, SysAdmin.
    """
    allowed_roles = ["Doctor", "Researcher", "Admin", "SysAdmin"]
    norm_r = user_in.role.lower().replace(" ", "")
    if norm_r == "doctor":
        user_in.role = "Doctor"
    elif norm_r in ("researcher", "healthcareresearcher"):
        user_in.role = "Researcher"
    elif norm_r in ("admin", "hospitaladministrator", "hospitaladmin"):
        user_in.role = "Admin"
    elif norm_r in ("sysadmin", "systemadministrator"):
        user_in.role = "SysAdmin"
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role. Role must be one of: {allowed_roles}"
        )
            
    # Set must_change_password = True on creation
    user_in.must_change_password = True
    user = UserService.create_user(user_in)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Member with this email already exists."
        )

    AuditService.log_event(
        user_id=str(current_user.get("_id")),
        user_email=current_user["email"],
        user_role=current_user.get("role", ""),
        action="MEMBER_CREATED",
        target_resource=user_in.email,
        details=f"Created {user_in.role} member ({user_in.full_name})"
    )

    return user

@router.get("", response_model=List[UserResponse], dependencies=[sysadmin_dependency])
def list_members(skip: int = 0, limit: int = 100):
    """
    Lists system members (SysAdmin only).
    """
    return UserService.get_users(skip=skip, limit=limit)

@router.get("/{user_id}", response_model=UserResponse, dependencies=[sysadmin_dependency])
def get_member(user_id: str):
    """
    Retrieves member details by ID (SysAdmin only).
    """
    user = UserService.get_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found."
        )
    return user

@router.put("/{user_id}", response_model=UserResponse, dependencies=[sysadmin_dependency])
def update_member(user_id: str, user_in: UserUpdate, current_user: dict = Depends(get_current_user)):
    """
    Updates member details or role (SysAdmin only).
    """
    user = UserService.update_user(user_id, user_in)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found or update failed."
        )

    AuditService.log_event(
        user_id=str(current_user.get("_id")),
        user_email=current_user["email"],
        user_role=current_user.get("role", ""),
        action="MEMBER_UPDATED",
        target_resource=user.get("email"),
        details=f"Updated details for member {user.get('email')}"
    )

    return user

@router.patch("/{user_id}/status", dependencies=[sysadmin_dependency])
def update_member_status(user_id: str, req: StatusUpdateRequest, current_user: dict = Depends(get_current_user)):
    """
    Activates or deactivates a member (SysAdmin only). Soft delete concept.
    """
    try:
        query = {"_id": ObjectId(user_id)}
    except Exception:
        query = {"_id": user_id}
        
    res = users_collection.find_one_and_update(
        query,
        {"$set": {"is_active": req.is_active}},
        return_document=True
    )
    if not res:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found."
        )

    action_label = "MEMBER_ACTIVATED" if req.is_active else "MEMBER_DEACTIVATED"
    AuditService.log_event(
        user_id=str(current_user.get("_id")),
        user_email=current_user["email"],
        user_role=current_user.get("role", ""),
        action=action_label,
        target_resource=res.get("email"),
        details=f"Set is_active={req.is_active} for user {res.get('email')}"
    )

    res["_id"] = str(res["_id"])
    return {"message": f"Member status updated to {'Active' if req.is_active else 'Inactive'}.", "user": res}

@router.patch("/{user_id}/password", dependencies=[sysadmin_dependency])
def reset_member_password(user_id: str, req: PasswordResetRequest, current_user: dict = Depends(get_current_user)):
    """
    Resets a member's password (SysAdmin only). Forces password change on next login.
    """
    try:
        query = {"_id": ObjectId(user_id)}
    except Exception:
        query = {"_id": user_id}
        
    new_hash = get_password_hash(req.new_password)
    res = users_collection.find_one_and_update(
        query,
        {"$set": {"hashed_password": new_hash, "must_change_password": True}},
        return_document=True
    )
    if not res:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found."
        )

    AuditService.log_event(
        user_id=str(current_user.get("_id")),
        user_email=current_user["email"],
        user_role=current_user.get("role", ""),
        action="PASSWORD_RESET_BY_SYSADMIN",
        target_resource=res.get("email"),
        details=f"SysAdmin reset password for user {res.get('email')}"
    )

    return {"message": "Member password reset successfully. User will be prompted to change password on login."}

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[sysadmin_dependency])
def delete_member(user_id: str, current_user: dict = Depends(get_current_user)):
    """
    Deletes a member account (SysAdmin only).
    """
    user = UserService.get_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found."
        )

    # Protect active logged-in SysAdmin from accidental self-deletion
    curr_id = str(current_user.get("_id"))
    curr_email = current_user.get("email")
    if str(user.get("_id")) == curr_id or user.get("email") == curr_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own active SysAdmin account."
        )

    success = UserService.delete_user(user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Delete member failed."
        )

    AuditService.log_event(
        user_id=str(current_user.get("_id")),
        user_email=current_user["email"],
        user_role=current_user.get("role", ""),
        action="MEMBER_REMOVED",
        target_resource=user.get("email"),
        details=f"Removed member {user.get('email')}"
    )
    return None

