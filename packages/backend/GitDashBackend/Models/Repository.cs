using System;
using System.Collections.Generic;

namespace GitDashBackend.Models;

public partial class Repository
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public string Name { get; set; } = null!;

    public DateTime LastVisited { get; set; }

    public int VisitsNumber { get; set; }

    public DateTime Created { get; set; }

    public virtual User User { get; set; } = null!;
}
