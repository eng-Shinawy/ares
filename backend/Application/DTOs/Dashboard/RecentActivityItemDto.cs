namespace Backend.Application.DTOs.Dashboard;

/// <summary>
/// Represents a single recent-activity event for the admin dashboard summary feed.
/// One item per category (booking, payment, user, vehicle, verification).
/// </summary>
public record RecentActivityItemDto(
    /// <summary>Category key: booking | payment | user | vehicle | verification</summary>
    string Type,
    /// <summary>Human-readable description of the event</summary>
    string Message,
    /// <summary>UTC timestamp of the event, serialised as ISO-8601</summary>
    DateTime CreatedAt,
    /// <summary>Icon hint — mirrors Type for the frontend to select the right icon</summary>
    string Icon
);
