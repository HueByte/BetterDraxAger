using BetterDraxAger.Api.DTOs;
using BetterDraxAger.Api.Entities;
using BetterDraxAger.Api.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace BetterDraxAger.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ITokenService _tokenService;
    private readonly IConfiguration _config;

    public AuthController(UserManager<ApplicationUser> userManager, ITokenService tokenService, IConfiguration config)
    {
        _userManager = userManager;
        _tokenService = tokenService;
        _config = config;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var user = new ApplicationUser { UserName = request.Username };
        var result = await _userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
        {
            var errors = result.Errors.Select(e => e.Description).ToList();
            return BadRequest(new ErrorResponse(errors));
        }

        var token = _tokenService.GenerateToken(user);
        var expiryHours = double.Parse(_config["JwtSettings:ExpiryHours"]!);

        return Ok(new AuthResponse(token, user.UserName!, DateTime.UtcNow.AddHours(expiryHours)));
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _userManager.FindByNameAsync(request.Username);
        if (user is null || !await _userManager.CheckPasswordAsync(user, request.Password))
            return Unauthorized(new ErrorResponse(["Invalid username or password."]));

        var token = _tokenService.GenerateToken(user);
        var expiryHours = double.Parse(_config["JwtSettings:ExpiryHours"]!);

        return Ok(new AuthResponse(token, user.UserName!, DateTime.UtcNow.AddHours(expiryHours)));
    }
}
