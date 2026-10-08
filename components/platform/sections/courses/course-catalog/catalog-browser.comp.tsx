"use client";

import { useRef, useState } from "react";
import { MagnifyingGlassIcon } from "@/components/icons/magnifying-glass-icon.comp";
import { SlidersIcon } from "@/components/icons/sliders-icon.comp";
import { XmarkIcon } from "@/components/icons/xmark-icon.comp";
import { EmptyState } from "@/components/platform/shared/empty-state/empty-state.comp";
import { PlatformCheckbox } from "@/components/platform/shared/platform-checkbox/platform-checkbox.comp";
import {
  PlatformPopup,
  type PlatformPopupHandle,
} from "@/components/platform/shared/platform-popup/platform-popup.comp";
import { foldForSearch } from "@/lib/fold-for-search";
import type { CourseLevelItem, CourseSummary } from "@/services/courses/courses.types";
import { CourseCard } from "../course-card.comp";
import "./catalog-browser.comp.css";

/** Whether the course is theirs: the two can be ticked together, which is the same as neither. */
type Ownership = "ADDED" | "NEW";

const OWNERSHIP: { code: Ownership; label: string }[] = [
  { code: "ADDED", label: "Los que llevas" },
  { code: "NEW", label: "Sin empezar" },
];

interface Filters {
  query: string;
  levels: Set<string>;
  topics: Set<string>;
  ownership: Set<Ownership>;
}

interface CatalogBrowserProps {
  /** Every published course, the ones the student added too. */
  courses: CourseSummary[];
  /** The catalog's levels, the easiest first. */
  levels: CourseLevelItem[];
  /** What `?nivel=` brought, ticked on arrival; one the catalog does not have is ignored. */
  initialLevel?: string;
}

/** What a course is searched by: its name, what it is about, who wrote it, its topics and levels. */
const searchTextOf = (course: CourseSummary) =>
  foldForSearch(
    [
      course.name,
      course.description,
      ...course.authorNames,
      ...course.contentTypes.map((contentType) => contentType.label),
      ...course.levels.map((level) => level.name),
    ]
      .filter(Boolean)
      .join(" "),
  );

/**
 * The catalog with its filters at the side (2026-10-07, «E2», the owner's
 * choice among two rounds of variants): a column with the search and the
 * filters — level, topic and whether the course is theirs, each option with
 * how many courses it has —, and over the courses how many are left, what is
 * filtered as pills that each take one filter off, and «Quitar filtros».
 *
 * Everything is filtered here, in the browser: the page brings the whole
 * catalog once. Options of one filter add up (a course of any ticked level);
 * filters narrow each other (that level AND that topic). On a phone the
 * column keeps only the search, and «Filtros» opens the rest in a popup.
 */
export function CatalogBrowser({ courses, levels, initialLevel }: CatalogBrowserProps) {
  const [filters, setFilters] = useState<Filters>(() => ({
    query: "",
    levels: new Set(initialLevel && levels.some((level) => level.slug === initialLevel) ? [initialLevel] : []),
    topics: new Set(),
    ownership: new Set(),
  }));
  const popup = useRef<PlatformPopupHandle>(null);

  // The topics come from the courses, in the catalog's order of the first
  // course that has each: a topic no course teaches has no filter.
  const topics = [
    ...new Map(courses.flatMap((course) => course.contentTypes).map((topic) => [topic.code, topic])).values(),
  ];

  const wanted = foldForSearch(filters.query);
  const shown = courses.filter(
    (course) =>
      (!wanted || searchTextOf(course).includes(wanted)) &&
      (filters.levels.size === 0 || course.levels.some((level) => filters.levels.has(level.slug))) &&
      (filters.topics.size === 0 || course.contentTypes.some((topic) => filters.topics.has(topic.code))) &&
      (filters.ownership.size !== 1 || filters.ownership.has(course.isAdded ? "ADDED" : "NEW")),
  );

  const toggle = <K extends "levels" | "topics" | "ownership">(key: K, value: string, on: boolean) =>
    setFilters((current) => {
      const next = new Set(current[key] as Set<string>);
      if (on) next.add(value);
      else next.delete(value);
      return { ...current, [key]: next };
    });

  const active = [
    ...levels
      .filter((level) => filters.levels.has(level.slug))
      .map((level) => ({ key: "levels" as const, value: level.slug, label: level.name })),
    ...topics
      .filter((topic) => filters.topics.has(topic.code))
      .map((topic) => ({ key: "topics" as const, value: topic.code, label: topic.label })),
    ...OWNERSHIP.filter((option) => filters.ownership.has(option.code)).map((option) => ({
      key: "ownership" as const,
      value: option.code,
      label: option.label,
    })),
  ];

  const facets = (
    <div className="catalog-browser__facets">
      <fieldset className="catalog-browser__facet">
        <legend className="catalog-browser__facet-title">Nivel</legend>
        {levels.map((level) => (
          <PlatformCheckbox
            key={level.slug}
            label={level.name}
            tone="accent"
            count={courses.filter((course) => course.levels.some((item) => item.slug === level.slug)).length}
            checked={filters.levels.has(level.slug)}
            onCheckedChange={(on) => toggle("levels", level.slug, on)}
            className="catalog-browser__option"
          />
        ))}
      </fieldset>

      {topics.length > 0 && (
        <fieldset className="catalog-browser__facet">
          <legend className="catalog-browser__facet-title">Tema</legend>
          {topics.map((topic) => (
            <PlatformCheckbox
              key={topic.code}
              label={topic.label}
              tone="accent"
              count={courses.filter((course) => course.contentTypes.some((item) => item.code === topic.code)).length}
              checked={filters.topics.has(topic.code)}
              onCheckedChange={(on) => toggle("topics", topic.code, on)}
              className="catalog-browser__option"
            />
          ))}
        </fieldset>
      )}

      <fieldset className="catalog-browser__facet">
        <legend className="catalog-browser__facet-title">Tus cursos</legend>
        {OWNERSHIP.map((option) => (
          <PlatformCheckbox
            key={option.code}
            label={option.label}
            tone="accent"
            count={courses.filter((course) => course.isAdded === (option.code === "ADDED")).length}
            checked={filters.ownership.has(option.code)}
            onCheckedChange={(on) => toggle("ownership", option.code, on)}
            className="catalog-browser__option"
          />
        ))}
      </fieldset>
    </div>
  );

  return (
    <div className="catalog-browser">
      <aside className="catalog-browser__aside" aria-label="Filtros">
        <label className="catalog-browser__search">
          <MagnifyingGlassIcon variant="classic-solid" className="catalog-browser__search-icon" />
          <input
            type="search"
            value={filters.query}
            onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))}
            placeholder="Buscar cursos"
            aria-label="Buscar cursos"
            className="catalog-browser__search-input"
          />
        </label>
        {facets}
      </aside>

      <div className="catalog-browser__results">
        <div className="catalog-browser__head">
          <p className="catalog-browser__count" aria-live="polite">
            {shown.length} {shown.length === 1 ? "curso" : "cursos"}
          </p>
          {active.length > 0 && (
            <button
              type="button"
              className="platform-row-action"
              onClick={() =>
                setFilters((current) => ({ ...current, levels: new Set(), topics: new Set(), ownership: new Set() }))
              }
            >
              Quitar filtros
            </button>
          )}
          <button
            type="button"
            className="platform-button platform-button_size_sm catalog-browser__open"
            onClick={(event) => popup.current?.open(event)}
          >
            <SlidersIcon variant="classic-solid" className="platform-button__icon" />
            Filtros{active.length > 0 && ` (${active.length})`}
          </button>
        </div>

        {active.length > 0 && (
          <ul className="catalog-browser__chips" aria-label="Filtros elegidos">
            {active.map((filter) => (
              <li key={`${filter.key}:${filter.value}`}>
                <button
                  type="button"
                  className="catalog-browser__chip"
                  onClick={() => toggle(filter.key, filter.value, false)}
                  aria-label={`Quitar el filtro «${filter.label}»`}
                >
                  {filter.label}
                  <XmarkIcon variant="classic-solid" className="catalog-browser__chip-icon" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {shown.length === 0 ? (
          <EmptyState
            title="Ningún curso con estos filtros"
            description="Quita alguno, o busca por el nombre de un tema o de un autor."
          />
        ) : (
          <div className="catalog-browser__grid">
            {shown.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>

      {/* On a phone the filters are here, behind «Filtros». */}
      <PlatformPopup ref={popup} title="Filtros" size="sm">
        <div className="catalog-browser__popup">
          {facets}
          <button
            type="button"
            className="platform-button platform-button_variant_ink catalog-browser__see"
            onClick={() => popup.current?.close()}
          >
            Ver {shown.length} {shown.length === 1 ? "curso" : "cursos"}
          </button>
        </div>
      </PlatformPopup>
    </div>
  );
}
