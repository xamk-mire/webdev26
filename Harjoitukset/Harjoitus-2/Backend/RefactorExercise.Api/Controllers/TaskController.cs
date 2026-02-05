using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;

namespace RefactorExercise.Api.Controllers;

// "DTO" - bad naming, mixed style (camelCase props), used for binding only
public class TaskRequest
{
    public string title { get; set; } = "";
    public string description { get; set; } = "";
    public string status { get; set; } = "Open";
    public int priority { get; set; } = 1;
}

// GOD CONTROLLER: routing, validation, "business rules", "data access" in one place. Bad naming throughout.
[ApiController]
[Route("api/[controller]")]
public class TaskController : ControllerBase
{
    private static List<object> d = new List<object>();
    private static int nxt = 1;

    [HttpGet]
    public IActionResult g()
    {
        return Ok(d);
    }

    [HttpGet("{id}")]
    public IActionResult Get1(int id)
    {
        var i = d.FirstOrDefault(x => id_from(x) == id);
        if (i == null)
            return NotFound();
        return Ok(i);
    }

    [HttpPost]
    public IActionResult Add([FromBody] TaskRequest r)
    {
        if (r == null) return BadRequest("invalid");
        var t = r.title ?? "";
        var dc = r.description ?? "";
        var st = r.status ?? "Open";
        var pr = r.priority;

        if (string.IsNullOrWhiteSpace(t)) return BadRequest("title required");
        if (t.Length > 200) return BadRequest("title too long");
        if (pr < 1 || pr > 5) return BadRequest("priority must be 1-5");
        if (st != "Open" && st != "InProgress" && st != "Done") return BadRequest("invalid status");

        var n = new Dictionary<string, object>
        {
            ["id"] = nxt++,
            ["title"] = t.Trim(),
            ["description"] = (dc ?? "").Trim(),
            ["status"] = st,
            ["priority"] = pr,
            ["createdAt"] = System.DateTime.UtcNow.ToString("o")
        };
        d.Add(n);
        return CreatedAtAction(nameof(Get1), new { id = n["id"] }, n);
    }

    [HttpPut("{id}")]
    public IActionResult Update(int id, [FromBody] TaskRequest r)
    {
        var i = d.FirstOrDefault(x => id_from(x) == id);
        if (i == null) return NotFound();
        if (r == null) return BadRequest("invalid");

        var t = r.title ?? "";
        var dc = r.description ?? "";
        var st = r.status ?? "";
        var pr = r.priority;

        if (string.IsNullOrWhiteSpace(t)) return BadRequest("title required");
        if (t.Length > 200) return BadRequest("title too long");
        if (pr < 1 || pr > 5) return BadRequest("priority must be 1-5");
        if (st != "Open" && st != "InProgress" && st != "Done") return BadRequest("invalid status");

        d.Remove(i);
        var u = new Dictionary<string, object>
        {
            ["id"] = id,
            ["title"] = t.Trim(),
            ["description"] = (dc ?? "").Trim(),
            ["status"] = st,
            ["priority"] = pr,
            ["createdAt"] = get_created(i)
        };
        d.Add(u);
        return Ok(u);
    }

    [HttpDelete("{id}")]
    public IActionResult Remove(int id)
    {
        var i = d.FirstOrDefault(x => id_from(x) == id);
        if (i == null) return NotFound();
        d.Remove(i);
        return NoContent();
    }

    private static int id_from(object o)
    {
        if (o is Dictionary<string, object> dict && dict.ContainsKey("id"))
            return Convert.ToInt32(dict["id"]);
        return 0;
    }

    private static string get_created(object o)
    {
        if (o is Dictionary<string, object> dict && dict.ContainsKey("createdAt"))
            return dict["createdAt"]?.ToString() ?? "";
        return System.DateTime.UtcNow.ToString("o");
    }
}
