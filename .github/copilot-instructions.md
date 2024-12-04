
# Custom Instructions for Copilot

## General Instructions

- **Naming**: Use explicit names for variables and functions.
- **Structure**: Ensure modular and well-organized architecture.
- **Security**: Protect against vulnerabilities such as XSS, CSRF, and others.
- **SOLID**: Adhere to SOLID principles.
- **Imports**: When generating code, add the import if it is missing.

## Front-end Instructions

- **User Friendly**: Intuitive, easy-to-use, and modern interface.
- **Accessibility**: WAG 2.1.1 (A) - Interactive components are keyboard accessible.
- **Responsive Design**: Mobile First approach.
- **Performance**: Lighthouse score of 90+.
- **SEO**: Use HTML5 semantic tags and metadata. Implement sitemap, robots.txt, Open Graph, Twitter Card, etc.
- **Internationalization**: Support for American English and French with i18n.
- **CSS Framework**: Bootstrap 5.
- **JavaScript Framework**: Vue.js 3 (Composition API).
- **Tests**: Jest.
- **Design Pattern**: Atomic Design.
- **Type Checking**: TypeScript.
- **UI**: Modern and minimalist.

## Back-end Instructions

- **REST API**: Follow REST principles and best practices.
- **Tests**: Unit tests with pyTest and 80% code coverage.
- **Exception Handling**: Proper exception management. Add comments to list possible causes of exceptions and always provide clear error messages.
  - Explicitly re-raise using `raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail='An error occurred while checking login attempts') from e`.
  - Explicitly re-raise using `except Exception as exc` and `raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Token has expired') from exc`.
- **Validation**: Validate input and output data with Pydantic V2.
- **ORM**: Use SQLAlchemy V2.
- **Dependencies**: Use Poetry for dependency management.
- **Naming Conventions**: Follow PEP8 naming conventions.
- **Logger**: Use the singleton logger from `from app.core.logger_config import logger` for logging.

### Architecture

- Separation of concerns: Use a layered architecture (Controllers, Services, Repositories).
- Centralized session management.
- Dependency injection.
- Consistent use of HTTP status codes.

## Pydantic Schema

- Class Naming: `ModelNameSchema`.
- Link with Postgres:

```python
model_config = {"from_attributes": True}
```

- Add necessary validations:

```python
from pydantic import BaseModel, Field, field_validator

@field_validator('coach_apply_date', mode='before')
@classmethod
def parse_coach_date(cls, value):
    ...
```

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
