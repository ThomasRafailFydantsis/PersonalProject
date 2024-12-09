using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Text.Json;

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
                    ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.Preserve,
                    MaxDepth = 64
                };

                // Serialize the object with custom settings
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
