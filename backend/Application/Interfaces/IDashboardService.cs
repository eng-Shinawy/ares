using Backend.Application.DTOs.Dashboard;

namespace Backend.Application.Interfaces;

public interface IDashboardService
{
    Task<DashboardSummaryDto> GetSummaryAsync(Guid? supplierId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Returns at most one latest real event per category (booking, payment, user, vehicle, verification),
    /// sorted by CreatedAt descending. Never returns fake or mock data.
    /// </summary>
    Task<IReadOnlyList<RecentActivityItemDto>> GetRecentSummaryAsync(Guid? supplierId, CancellationToken cancellationToken = default);
}
