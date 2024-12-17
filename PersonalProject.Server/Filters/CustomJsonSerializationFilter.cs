using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace PersonalProject.Server.Filters
{
    public class CustomJsonSerializationFilter : IActionFilter
    {
        public void OnActionExecuting(ActionExecutingContext context)
        {
            // No action required before execution
        }

        public void OnActionExecuted(ActionExecutedContext context)
        {
            if (context.Result is ObjectResult objectResult)
            {
                var options = new JsonSerializerOptions
                {
                    WriteIndented = false,
                    ReferenceHandler = ReferenceHandler.IgnoreCycles // Enable cycle handling
                };

                var json = JsonSerializer.Serialize(objectResult.Value, options);
                context.Result = new ContentResult
                {
                    Content = json,
                    ContentType = "application/json",
                    StatusCode = objectResult.StatusCode
                };
            }
        }
    }
}
