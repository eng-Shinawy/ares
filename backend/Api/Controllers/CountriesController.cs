using Backend.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Controllers;

[ApiController]
[Route("api")]
public class CountriesController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public CountriesController(IApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Fetch a paginated list of countries.
    /// </summary>
    [HttpGet("countries/{page:int}/{size:int}/{language}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCountries(
        int page,
        int size,
        string language,
        [FromQuery] string? s,
        CancellationToken cancellationToken)
    {
        if (page < 1) page = 1;
        if (size < 1) size = 10;

        var query = _context.UserAddresses
            .Where(u => !string.IsNullOrWhiteSpace(u.Country))
            .Select(u => u.Country!)
            .Distinct();

        if (!string.IsNullOrWhiteSpace(s))
        {
            query = query.Where(c => c.Contains(s));
        }

        var totalRecords = await query.CountAsync(cancellationToken);

        var countries = await query
            .OrderBy(c => c)
            .Skip((page - 1) * size)
            .Take(size)
            .ToListAsync(cancellationToken);

        var resultData = countries.Select(c => new
        {
            _id = c,
            name = c,
            image = (string?)null
        });

        return Ok(new
        {
            resultData,
            pageInfo = new[] { new { totalRecords } }
        });
    }

    /// <summary>
    /// Check if a country has locations before attempting deletion.
    /// </summary>
    [HttpGet("check-country/{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> CheckCountry(string id, CancellationToken cancellationToken)
    {
        var hasLocations = await _context.UserAddresses
            .AnyAsync(u => u.Country == id, cancellationToken);

        if (hasLocations)
        {
            return Ok(new { message = "Country has locations — cannot delete" });
        }

        return NoContent();
    }

    /// <summary>
    /// Delete a country.
    /// </summary>
    [HttpDelete("delete-country/{id}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteCountry(string id, CancellationToken cancellationToken)
    {
        var hasLocations = await _context.UserAddresses
            .AnyAsync(u => u.Country == id, cancellationToken);

        if (hasLocations)
        {
            return BadRequest(new { message = "Country has locations — blocked" });
        }

        // Since countries are derived from UserAddress, if it has no locations, 
        // it virtually doesn't exist in our system anymore.
        // We return 200 OK to satisfy the frontend's expectation of a successful deletion.
        return Ok(new { message = "Country deleted" });
    }
}
