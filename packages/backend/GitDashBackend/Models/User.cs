using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace GitDashBackend.Models;

public partial class User
{
    public int Id { get; set; }

    public string Username { get; set; } = null!;

    public DateTime Created { get; set; }

    [JsonIgnore]
    public virtual ICollection<Log> Logs { get; set; } = new List<Log>();

    [JsonIgnore]
    public virtual ICollection<Repository> Repositories { get; set; } = new List<Repository>();
}
