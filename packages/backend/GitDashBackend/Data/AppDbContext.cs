using System;
using System.Collections.Generic;
using GitDashBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace GitDashBackend.Data;

public partial class AppDbContext : DbContext
{
    public AppDbContext()
    {
    }

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Log> Logs { get; set; }

    public virtual DbSet<Repository> Repositories { get; set; }

    public virtual DbSet<User> Users { get; set; }
/*
    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseNpgsql("Host=localhost;Database=gitdashdb;Username=exampleuser;Password=examplepassword123");
*/
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Log>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("log_pk");

            entity.ToTable("log");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("nextval('log_id_seq1'::regclass)")
                .HasColumnName("id");
            entity.Property(e => e.Created)
                .HasColumnType("timestamp without time zone")
                .HasColumnName("created");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.VisitedEndpoint)
                .HasColumnType("character varying")
                .HasColumnName("visited_endpoint");

            entity.HasOne(d => d.User).WithMany(p => p.Logs)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("log_fk");
        });

        modelBuilder.Entity<Repository>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("repository_pk");

            entity.ToTable("repository");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("nextval('repository_id_seq1'::regclass)")
                .HasColumnName("id");
            entity.Property(e => e.Created)
                .HasColumnType("timestamp without time zone")
                .HasColumnName("created");
            entity.Property(e => e.LastVisited)
                .HasColumnType("timestamp without time zone")
                .HasColumnName("last_visited");
            entity.Property(e => e.Name)
                .HasColumnType("character varying")
                .HasColumnName("name");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.VisitsNumber).HasColumnName("visits_number");

            entity.HasOne(d => d.User).WithMany(p => p.Repositories)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("repository_fk");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("user_pk");

            entity.ToTable("user");

            entity.HasIndex(e => e.Username, "user_un").IsUnique();

            entity.Property(e => e.Id)
                .HasDefaultValueSql("nextval('user_id_seq1'::regclass)")
                .HasColumnName("id");
            entity.Property(e => e.Created)
                .HasColumnType("timestamp without time zone")
                .HasColumnName("created");
            entity.Property(e => e.Username)
                .HasColumnType("character varying")
                .HasColumnName("username");
        });
        modelBuilder.HasSequence("log_id_seq").HasMax(2147483647L);
        modelBuilder.HasSequence("repository_id_seq").HasMax(2147483647L);
        modelBuilder.HasSequence("user_id_seq").HasMax(2147483647L);

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
