# Date Flexibility Mapping Documentation

This document clarifies the mapping between UI date flexibility options shown to users and the corresponding database values.

## Date Flexibility Options

The date flexibility options in the UI are mapped to specific values in the database using the `DateFlexibilityType` enum. Below is the complete mapping with explanations:

| UI Option | Database Value | Description |
|-----------|---------------|-------------|
| Fixed Dates | `fixed` | User has specific travel dates with no flexibility |
| ± 3 Days | `flexible-few` | User can travel 3 days before or after their preferred dates |
| ± 1 Week | `flexible-week` | User can travel up to 1 week before or after their preferred dates |
| Very Flexible | `very-flexible` | User is completely flexible with travel dates |
| Custom | Uses `customDateFlexibility` field | For the "Longer" duration option, users can specify a custom number of days |

## Implementation Details

### Database Schema

- **Primary field**: `date_flexibility` (TEXT) - Stores one of the enum values: 'fixed', 'flexible-few', 'flexible-week', or 'very-flexible'
- **Custom field**: `custom_date_flexibility` (TEXT) - Only populated when a custom value is provided (typically when travel duration is 'longer')

### Code Implementation

When a user selects "Longer" as their travel duration and provides a custom flexibility value:

1. The `date_flexibility` field is set to the appropriate enum value from the selected option
2. The `custom_date_flexibility` field stores the numeric value entered by the user

Example:
```typescript
// User selects "± 3 Days" with custom value of "40" for a longer trip
{
  date_flexibility: 'flexible-few',  // From the enum
  custom_date_flexibility: '40'      // Custom numeric value
}
```

## UI Display Logic

When displaying date flexibility to users, the application should:

1. First check the `date_flexibility` value to determine which option was selected
2. If a custom value exists in `custom_date_flexibility`, display that alongside the selected option

This ensures consistent representation of the user's preferences throughout the application.
