# Pydantic V2 Custom Instructions

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
