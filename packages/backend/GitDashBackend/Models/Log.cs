using System;
using System.Collections.Generic;

namespace GitDashBackend.Models;

public partial class Log
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public string VisitedEndpoint { get; set; } = null!;

    public DateTime Created { get; set; }

    public virtual User User { get; set; } = null!;
}
