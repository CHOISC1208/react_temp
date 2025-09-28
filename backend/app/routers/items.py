import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db_session
from app.models import Item, User
from app.schemas.item import ItemCreate, ItemRead, ItemUpdate

router = APIRouter(prefix="/items", tags=["items"])


@router.post("", response_model=ItemRead, status_code=status.HTTP_201_CREATED)
def create_item(
    item_in: ItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
) -> ItemRead:
    item = Item(name=item_in.name, owner_id=current_user.id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return ItemRead.model_validate(item)


@router.get("", response_model=list[ItemRead])
def list_items(current_user: User = Depends(get_current_user), db: Session = Depends(get_db_session)) -> list[ItemRead]:
    items = (
        db.query(Item)
        .filter(Item.owner_id == current_user.id)
        .order_by(Item.created_at.desc())
        .all()
    )
    return [ItemRead.model_validate(item) for item in items]


def _get_owned_item(db: Session, item_id: uuid.UUID, user: User) -> Item:
    item = db.get(Item, item_id)
    if not item or item.owner_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    return item


@router.get("/{item_id}", response_model=ItemRead)
def get_item(
    item_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
) -> ItemRead:
    item = _get_owned_item(db, item_id, current_user)
    return ItemRead.model_validate(item)


@router.patch("/{item_id}", response_model=ItemRead)
def update_item(
    item_id: uuid.UUID,
    item_in: ItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
) -> ItemRead:
    item = _get_owned_item(db, item_id, current_user)
    if item_in.name is not None:
        item.name = item_in.name
    db.commit()
    db.refresh(item)
    return ItemRead.model_validate(item)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(
    item_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
) -> None:
    item = _get_owned_item(db, item_id, current_user)
    db.delete(item)
    db.commit()
