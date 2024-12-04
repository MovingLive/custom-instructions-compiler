# FastAPI Custom instructions

## API Endpoints

- Example of a standard route:

```python
from fastapi import APIRouter, HTTPException, status
from sqlalchemy.exc import IntegrityError

@router.delete(
    "/themes/{theme_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_model=None,
    responses={
        404: {"description": "Theme not found"},
        403: {"description": "Not enough permissions"},
        409: {"description": "Theme cannot be deleted - has dependencies"}
    }
)
@role_required(UserRole.COACH)
async def delete_theme(
    theme_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        await theme_service.delete(theme_id)
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Theme cannot be deleted as it has associated content"
        )
```