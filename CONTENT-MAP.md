# Content Map

Canonical list of every topic page: **slug** (file name and URL), **title**, and **scope**.
Cross-links between pages must use only these slugs. Order = `sidebar.order`.
All pages below are written (2026-11-02). Source of truth for scope details: [PLAN.md §5](PLAN.md).

Question file per section: `src/data/questions/<section>.json`. Large sections may split into
`<section>.<part>.json` (same `"section"` value inside).

## csharp: C# & .NET Runtime

| # | slug | title | scope |
|---|------|-------|-------|
| 1 | dotnet-platform | .NET Platform, CLR & JIT | CLR, IL, JIT vs AOT/ReadyToRun, BCL, CTS/CLS, .NET Framework vs .NET (Core) vs .NET 8/10/11, LTS/STS, assemblies, NuGet |
| 2 | value-reference-types | Value vs Reference Types | stack vs heap (and the nuance), boxing/unboxing, struct vs class, record / record struct, `in`/`ref`/`out`, equality, nullable value & reference types |
| 3 | oop-csharp | OOP in C# | 4 pillars, abstract class vs interface, default interface methods, virtual/override/new, sealed, access modifiers, static classes, constructors chaining, partial |
| 4 | memory-gc | Memory, GC & IDisposable | generations, LOH/POH, workstation vs server GC, finalizers, IDisposable/using/Dispose pattern, IAsyncDisposable, weak refs, common leaks |
| 5 | collections-generics | Collections & Generics | List/Dictionary/HashSet/Queue/Stack/LinkedList/Sorted*, complexity table, concurrent & immutable & frozen collections, interfaces hierarchy, generic constraints, covariance/contravariance |
| 6 | linq | LINQ | query vs method syntax, deferred vs immediate, IEnumerable vs IQueryable, expression trees, common operators, GroupBy/Join/SelectMany, performance traps, multiple enumeration |
| 7 | delegates-events | Delegates, Events & Lambdas | delegate types, multicast, Func/Action/Predicate, events vs delegates, event pattern, lambdas, closures & captured loop variable, local functions |
| 8 | async-await ✅ | Async/Await Deep Dive | (done) |
| 9 | threading | Threading & Synchronization | Thread vs Task vs ThreadPool, Parallel/PLINQ, lock/Monitor, SemaphoreSlim, Interlocked, ReaderWriterLockSlim, Channel<T>, race conditions, deadlock, volatile, thread-safety of collections |
| 10 | exceptions | Exception Handling | hierarchy, try/catch/finally, `throw` vs `throw ex`, exception filters, custom exceptions, cost, when not to use exceptions (Result pattern pointer), global handling pointer |
| 11 | strings-span | Strings, StringBuilder & Span | immutability, interning, StringBuilder, string comparison & culture, `Span<T>`/`Memory<T>`, stackalloc, ArrayPool, raw string literals, interpolation handlers |
| 12 | modern-csharp | Modern C# (9 → 15) | records, init, pattern matching, switch expressions, top-level, file-scoped namespaces, global usings, required, primary constructors, collection expressions, params collections, extension members, `field` keyword, union types & closed hierarchies (C# 15) |
| 13 | reflection-attributes | Reflection, Attributes & Source Generators | Type/MethodInfo, Activator, custom attributes, performance cost, source generators vs reflection, AOT/trimming implications |
| 14 | serialization | JSON Serialization | System.Text.Json vs Newtonsoft, options, naming policy, converters, polymorphic serialization, source-generated contexts, common pitfalls |

## aspnet: ASP.NET Core Web API

| # | slug | title | scope |
|---|------|-------|-------|
| 1 | hosting-startup | Hosting Model & Program.cs | WebApplication builder, generic host, Kestrel, IIS in/out-of-process, reverse proxy, environments, launchSettings, app lifetime |
| 2 | middleware-pipeline | Request Pipeline & Middleware | order matters (standard order diagram), Use/Run/Map/MapWhen, custom middleware (convention & IMiddleware), short-circuiting, endpoint routing |
| 3 | dependency-injection | Dependency Injection | lifetimes, captive dependency, scope validation, keyed services, IServiceScopeFactory, factories, multiple registrations, TryAdd, service locator anti-pattern, Scrutor decoration |
| 4 | controllers-minimal-apis | Controllers, Minimal APIs & Model Binding | ApiController behaviours, routing & attribute routes, route constraints, model binding sources, validation (DataAnnotations, FluentValidation), ProblemDetails, IActionResult vs TypedResults, minimal API groups & filters |
| 5 | filters | Filters vs Middleware | filter types & order (diagram), action/result/exception/resource/auth filters, global vs attribute, DI in filters (ServiceFilter/TypeFilter), when to choose middleware |
| 6 | configuration-options | Configuration & Options Pattern | providers & precedence, appsettings per env, user secrets, env vars, Key Vault, IOptions vs IOptionsSnapshot vs IOptionsMonitor, validation on start |
| 7 | logging-observability | Logging & Observability | ILogger, levels, structured logging, scopes, Serilog sinks, high-performance LoggerMessage, OpenTelemetry traces/metrics, correlation ids, App Insights (AWS: CloudWatch/X-Ray) |
| 8 | authentication-authorization | Authentication & Authorization | authN vs authZ, JWT bearer flow (diagram), validating tokens, refresh tokens, cookie auth, claims, roles, policies & requirements, resource-based authZ, ASP.NET Core Identity overview, Entra ID |
| 9 | error-handling | Global Error Handling | UseExceptionHandler, IExceptionHandler, ProblemDetails service, status code pages, developer exception page, mapping domain exceptions, don't leak internals |
| 10 | caching | Caching in ASP.NET Core | IMemoryCache, IDistributedCache (Redis), HybridCache, output caching vs response caching, ETag/conditional requests, cache stampede, invalidation |
| 11 | performance-resilience | Performance & Resilience | async all the way, IHttpClientFactory (socket exhaustion), Polly / Microsoft.Extensions.Http.Resilience (retry, timeout, circuit breaker), response compression, pagination, streaming, object pooling, benchmarks |
| 12 | versioning-openapi-cors | API Versioning, OpenAPI & CORS | versioning strategies (URL/header/query), Asp.Versioning, OpenAPI document generation (.NET 9+ built-in), Swagger UI/Scalar, CORS (preflight diagram, policies, common errors) |
| 13 | rate-limiting-health-checks | Rate Limiting & Health Checks | built-in rate limiter (fixed, sliding, token bucket, concurrency), partitioning per user/IP, 429 handling; health checks liveness vs readiness, UI, K8s probes |
| 14 | background-services | Background Services | IHostedService vs BackgroundService, scoped services inside, Channel<T> queue, graceful shutdown, timers (PeriodicTimer), Hangfire/Quartz, Azure Functions/WebJobs (AWS: Lambda) |
| 15 | signalr-grpc | SignalR, gRPC & GraphQL | SignalR hubs, transports, scale-out (Redis/Azure SignalR); gRPC (protobuf, streaming, HTTP/2, when to use); REST vs gRPC vs GraphQL comparison |
| 16 | rest-api-design | REST API Design | resources & naming, HTTP verbs semantics, status codes cheat sheet, idempotency, PUT vs PATCH, pagination/filter/sort conventions, HATEOAS-lite, error format, Richardson maturity |
| 17 | aspnet-scenarios | Scenario Questions | "request comes in → what happens", "scoped in singleton", "secure this API", "API is slow, how to debug", "10k req/s", "file upload API", each with a structured answer |

## data: EF Core & SQL Server

| # | slug | title | scope |
|---|------|-------|-------|
| 1 | efcore-architecture | EF Core Architecture & Change Tracking | DbContext lifetime, change tracker, entity states, SaveChanges flow (diagram), DbContext pooling, IDbContextFactory |
| 2 | efcore-modelling | Modelling & Relationships | conventions, data annotations vs Fluent API, one-to-many/one-to-one/many-to-many, owned types, value conversions, shadow props, inheritance (TPH/TPT/TPC), global query filters |
| 3 | efcore-querying | Querying & the N+1 Problem | LINQ to SQL translation, client vs server evaluation, projections (Select to DTO), AsNoTracking / AsNoTrackingWithIdentityResolution, Include/ThenInclude, split queries, N+1 with fix |
| 4 | loading-strategies | Eager, Lazy & Explicit Loading | each strategy with SQL generated, proxies, pros/cons, which to choose for APIs |
| 5 | migrations | Migrations & Seeding | add/update/remove, scripts for prod (idempotent), bundles, data seeding, team conflicts, zero-downtime changes |
| 6 | transactions-raw-sql | Transactions, Bulk Ops & Raw SQL | implicit transaction in SaveChanges, explicit BeginTransaction, TransactionScope, ExecuteUpdate/ExecuteDelete, FromSql/SqlQuery, stored procs from EF, SQL injection safety with interpolation |
| 7 | concurrency | Concurrency Control | optimistic (rowversion, concurrency tokens, DbUpdateConcurrencyException handling), pessimistic (UPDLOCK), last-write-wins problems |
| 8 | efcore-performance | EF Core Performance | logging generated SQL, compiled queries, context pooling, batching, indexes in model, avoiding cartesian explosion, keyless entities, Dapper vs EF comparison |
| 9 | repository-uow-ef | Repository & Unit of Work with EF | is DbContext already a UoW? generic repo pros/cons, specification pattern, testing strategies |
| 10 | sql-joins-queries | SQL Joins & Core Queries | join types (Venn + table examples), GROUP BY/HAVING, WHERE vs HAVING, subqueries vs joins, EXISTS vs IN, UNION vs UNION ALL, CTEs (incl. recursive), CASE, logical query processing order |
| 11 | window-functions | Window Functions | ROW_NUMBER, RANK, DENSE_RANK, NTILE, LAG/LEAD, running totals with SUM OVER, PARTITION BY, frames |
| 12 | indexes | Indexes | clustered vs non-clustered (B-tree diagram), covering & INCLUDE, composite column order, filtered, unique, seek vs scan, key lookups, write cost, fragmentation |
| 13 | execution-plans | Execution Plans & Query Tuning | reading plans, SARGability, implicit conversions, parameter sniffing, statistics, missing index hints, query store, a tuning checklist |
| 14 | transactions-isolation | Transactions, Isolation & Locking | ACID, isolation levels vs anomalies table, locks & lock escalation, snapshot/RCSI, deadlocks (diagram) and how to prevent, NOLOCK myths |
| 15 | stored-procs-views | Stored Procedures, Functions, Views & Triggers | proc vs function, scalar vs table-valued, views & indexed views, triggers (when not to), temp tables vs table variables vs CTE, TRY/CATCH |
| 16 | normalization | Normalization & Keys | 1NF-3NF/BCNF with examples, denormalization trade-offs, primary/foreign/unique/composite/surrogate keys, constraints, ER modelling |
| 17 | sql-interview-problems | Classic SQL Interview Problems | nth highest salary (3 ways), duplicates find/delete, employees earning more than manager, running totals, gaps & islands, top N per group, hierarchical query, pivot |
| 18 | sql-vs-nosql | SQL vs NoSQL | document/key-value/column/graph, Cosmos DB (AWS: DynamoDB), Redis, MongoDB, when to pick which, polyglot persistence |

## angular: Angular (v20-22)

| # | slug | title | scope |
|---|------|-------|-------|
| 1 | architecture-bootstrap | Architecture & Bootstrapping | standalone apps, bootstrapApplication, app.config providers, zoneless default, project structure, NgModules (legacy) vs standalone, CLI & builders (esbuild) |
| 2 | components-templates | Components & Templates | component anatomy, template syntax & binding types, control flow `@if/@for/@switch` with `track`, `@let`, signal inputs `input()`/`input.required()`, `output()`, `model()`, content projection & ng-content, `viewChild()`/`contentChild()`, host bindings, view encapsulation |
| 3 | lifecycle-hooks | Lifecycle Hooks | each hook & order (diagram), constructor vs ngOnInit, ngOnChanges with signal inputs, afterNextRender/afterEveryRender, DestroyRef |
| 4 | change-detection | Change Detection | how CD works (tree diagram), Default vs OnPush, zone.js vs zoneless, what marks a view dirty, signals & CD, markForCheck/detectChanges, ExpressionChangedAfterItHasBeenChecked |
| 5 | signals | Signals Deep Dive | signal, computed, effect, linkedSignal, untracked, equality, toSignal/toObservable, signal vs RxJS decision table, pitfalls (effects to sync state) |
| 6 | resources | Resources: resource, rxResource & httpResource | async data as signals, params/loader, status/value/error, reload, cancellation, vs HttpClient + subscribe |
| 7 | dependency-injection | Dependency Injection | providers (useClass/useValue/useFactory/useExisting), inject(), providedIn root vs component, hierarchical injectors (diagram), environment vs element injectors, InjectionToken, multi providers, resolution modifiers |
| 8 | state-management | State Management | component state, signal-based service store, NgRx Store/Effects/Selectors, NgRx SignalStore, when to use which, facade pattern |
| 9 | routing | Routing | routes config, lazy loading (loadComponent/loadChildren), functional guards (CanActivate/CanMatch/CanDeactivate), resolvers, withComponentInputBinding, nested & named outlets, preloading, route reuse |
| 10 | forms | Forms | Signal Forms (v22), Reactive Forms (FormGroup/FormControl/FormArray, typed forms, validators, async validators, valueChanges), template-driven, ControlValueAccessor, comparison table |
| 11 | http-interceptors | HttpClient & Interceptors | provideHttpClient(withFetch), functional interceptors (auth token, error, retry, loading), error handling, HttpContext, caching |
| 12 | rxjs-basics | RxJS Fundamentals | Observable vs Promise, cold vs hot, Subject/BehaviorSubject/ReplaySubject/AsyncSubject, subscription management, async pipe, takeUntilDestroyed, error & complete |
| 13 | rxjs-operators | RxJS Operators | switchMap vs mergeMap vs concatMap vs exhaustMap (marble diagrams), combineLatest/forkJoin/withLatestFrom/zip, debounceTime/distinctUntilChanged typeahead, catchError/retry, shareReplay, scan |
| 14 | directives-pipes | Directives & Pipes | attribute vs structural directives, custom directive, host directives, pure vs impure pipes, custom pipe, async pipe internals |
| 15 | performance | Performance | OnPush/zoneless, `track`, `@defer` blocks & triggers, lazy routes, bundle budgets & analysis, virtual scroll (CDK), NgOptimizedImage, memoised computed, web workers |
| 16 | ssr-hydration | SSR, Hydration & Prerendering | CSR vs SSR vs SSG, hydration, incremental hydration, event replay, render modes per route, browser-only APIs, transfer cache |
| 17 | testing | Testing Angular | Vitest/Jasmine, TestBed, component testing, harnesses, mocking services, HttpTestingController, testing signals, inputs/outputs, fakeAsync vs async |
| 18 | security | Angular Security | built-in sanitization, DomSanitizer & bypassSecurityTrust*, XSS via innerHTML, CSRF/XSRF support, CSP, storing tokens, route guards are not security |
| 19 | version-history | Angular Version History (v14 → v22) | per version headline changes and why they matter in interviews, migration notes |
| 20 | angular-scenarios | Scenario Questions | parent/child communication options, sibling communication, shared service vs store, "view not updating", memory leaks, slow list, typeahead, each with structured answer |

## web: TypeScript, JS, HTML & CSS

| # | slug | title | scope |
|---|------|-------|-------|
| 1 | typescript-types | TypeScript Type System | primitives, unions/intersections, literal types, interfaces vs type aliases, enums vs const objects, any vs unknown vs never, type guards & narrowing, discriminated unions |
| 2 | typescript-advanced | Advanced TypeScript | generics & constraints, utility types (Partial, Pick, Omit, Record, ReturnType...), keyof/typeof/indexed access, mapped & conditional types, infer, template literal types, satisfies, decorators, strict flags |
| 3 | js-event-loop | Event Loop, Promises & Async | call stack, macrotasks vs microtasks (diagram), output-order puzzles, promise states & combinators (all/allSettled/race/any), async/await error handling |
| 4 | js-core | Closures, Scope, this & Prototypes | var/let/const & TDZ, hoisting, closures (counter, loop pitfall), `this` rules & arrow functions, call/apply/bind, prototype chain, classes as sugar |
| 5 | js-practical | Practical JavaScript | debounce/throttle implementations, deep vs shallow copy (structuredClone), == vs ===, truthy/falsy, modules (ESM vs CommonJS), immutability, array methods, optional chaining & nullish coalescing |
| 6 | browser-dom | Browser, DOM & Storage | DOM events (capture/bubble/delegation), localStorage vs sessionStorage vs cookies vs IndexedDB, CORS from the browser side, critical rendering path (diagram), reflow/repaint, web workers |
| 7 | html-accessibility | HTML Semantics & Accessibility | semantic elements, forms & labels, ARIA basics, keyboard navigation, alt text, SEO basics, meta tags |
| 8 | css-layout | CSS Layout & Styling | box model, specificity & cascade, positioning, flexbox vs grid, responsive design & media/container queries, units, CSS variables, BEM, Angular view encapsulation link |

## dsa: DSA & Coding (C# primary, TypeScript for the most common)

| # | slug | title | scope |
|---|------|-------|-------|
| 1 | big-o | Big-O & Complexity Analysis | notation, common classes chart, analysing loops/recursion, amortised, space complexity, .NET collection operation costs |
| 2 | arrays-strings | Arrays & Strings Patterns | two pointers, sliding window (fixed & variable), prefix sums, Kadane; 5-6 classic problems with C# + TS solutions |
| 3 | hashing | Hashing Patterns | frequency maps, two-sum family, group anagrams, longest consecutive sequence, subarray sum = k |
| 4 | stacks-queues | Stacks & Queues | valid parentheses, min stack, monotonic stack (next greater element, daily temperatures), queue via stacks, sliding window max (deque) |
| 5 | linked-lists | Linked Lists | reverse (iterative/recursive), detect cycle (Floyd), merge two sorted, middle node, remove nth from end, LRU cache (Dictionary + LinkedList) |
| 6 | recursion-backtracking | Recursion & Backtracking | recursion template, permutations, subsets, combination sum, word search, memoisation bridge to DP |
| 7 | binary-search | Binary Search | classic template, first/last occurrence, rotated sorted array, search on answer space (min capacity, koko bananas) |
| 8 | sorting | Sorting | bubble/insertion/merge/quick/heap comparison table, merge sort & quick sort code, stability, custom IComparer / Comparison, Array.Sort internals (introsort) |
| 9 | trees-bst | Trees & BST | traversals (recursive + iterative), level order, height/diameter, validate BST, LCA, serialize; tree diagram |
| 10 | heaps | Heaps & Priority Queues | PriorityQueue<TElement,TPriority>, top-k elements, k closest points, merge k sorted lists, median of stream |
| 11 | graphs | Graphs | representations, BFS/DFS, number of islands, topological sort (course schedule), Dijkstra, union-find basics |
| 12 | dynamic-programming | Dynamic Programming | recognising DP, top-down vs bottom-up, climbing stairs, house robber, coin change, LIS, 0/1 knapsack, LCS, edit distance |
| 13 | greedy-intervals | Greedy & Intervals | merge intervals, insert interval, meeting rooms, non-overlapping intervals, jump game |
| 14 | bit-manipulation | Bit Manipulation | operators, single number (XOR), count bits, power of two, masks/flags enums |
| 15 | problem-list | Curated Problem List | ~75 problems grouped by pattern: name, difficulty, key idea hint, complexity, link to LeetCode, checkbox column |
| 16 | csharp-coding-round | C# Coding Round | LINQ puzzles, string manipulation (reverse words, palindrome, char count), implement IEnumerable/yield, custom IComparer, generic repository stub, thread-safe singleton, producer-consumer with Channel, async retry helper |
| 17 | angular-live-coding | Angular Live Coding | todo/CRUD with signals, debounced search with RxJS, custom pipe, custom directive, reactive form with custom validator, parent-child communication, each with full code |

## system-design: System Design (HLD + LLD)

| # | slug | title | scope |
|---|------|-------|-------|
| 1 | interview-framework | How to Run a Design Interview | 45-min framework (diagram), requirements (functional/non-functional), back-of-envelope estimates (numbers to know), API, data model, HLD, deep dives, trade-offs, what interviewers score |
| 2 | scaling-fundamentals | Scaling Fundamentals | vertical vs horizontal, stateless services, load balancers L4/L7 & algorithms, CDN, DNS, reverse proxy, autoscaling, latency numbers |
| 3 | caching | Caching at Scale | where to cache (diagram), cache-aside/read-through/write-through/write-behind, eviction LRU/LFU/TTL, invalidation, stampede/thundering herd, hot keys, Redis data structures |
| 4 | databases-at-scale | Databases at Scale | SQL vs NoSQL decision, replication (leader-follower, multi-leader), read replicas, sharding strategies & consistent hashing, CAP & PACELC, consistency models, indexes at scale |
| 5 | messaging-basics | Queues & Pub/Sub Basics | why async, queue vs topic, back-pressure, fan-out; short page linking to the microservices section for depth |
| 6 | api-design-rate-limiting | API Design & Rate Limiting | REST vs gRPC vs GraphQL vs WebSockets/SSE, pagination (offset vs cursor), idempotency keys, rate limiting algorithms (token bucket, leaky bucket, fixed/sliding window) with diagrams |
| 7 | storage-files-cdn | Blob Storage, Files & CDN | blob storage (Azure Blob / AWS S3), SAS / pre-signed URLs, chunked & resumable upload, CDN caching & invalidation, image processing pipeline |
| 8 | auth-in-design | Auth in System Design | session vs token at scale, OAuth2/OIDC with an identity provider, API gateway auth, service-to-service auth (managed identity / IAM roles), secrets |
| 9 | azure-aws-mapping | Azure Services Map (with AWS) | table of compute/data/messaging/security/observability services with AWS equivalent and when to use, reference architecture diagram for a .NET + Angular app |
| 10 | tradeoffs-cheatsheet | Trade-offs Cheat Sheet | common trade-off pairs and phrases to say (consistency vs availability, latency vs throughput, normalisation vs denormalisation, sync vs async, push vs pull...) |
| 11 | case-url-shortener | Case Study: URL Shortener | full walk-through using the framework: requirements, estimates, API, schema, ID generation (base62, counter vs hash), caching, redirects 301 vs 302, analytics, scaling |
| 12 | case-notification-system | Case Study: Notification System | email/SMS/push, templates, user preferences, queues per channel, retries, rate limits, dedup, providers, tracking |
| 13 | case-rate-limiter | Case Study: Distributed Rate Limiter | where it sits, algorithms, Redis implementation (Lua/atomic), headers, multi-region, failure modes |
| 14 | case-chat-system | Case Study: Real-time Chat | WebSockets/SignalR, presence, message storage & ordering, delivery receipts, group chat fan-out, offline push |
| 15 | case-file-upload | Case Study: File Upload & Sharing | direct-to-blob upload with SAS, chunking, virus scan pipeline, metadata DB, sharing links, CDN download |
| 16 | case-ecommerce-orders | Case Study: E-commerce Order & Payment | cart, inventory reservation, order saga, payment gateway & idempotency, outbox, order status, flash-sale concerns |
| 17 | case-job-scheduler | Case Study: Job Scheduler | scheduled & delayed jobs, workers, leases & at-least-once, retries/backoff, cron parsing, Hangfire/Quartz/Azure Functions timer comparison |
| 18 | case-news-feed | Case Study: News Feed | fan-out on write vs read, hybrid for celebrities, ranking, pagination, caching |
| 19 | case-autocomplete | Case Study: Search Autocomplete | trie, top-k per prefix, precomputation, caching, debounce on client, ranking updates |
| 20 | lld-approach | How to Approach LLD | steps (requirements → entities → relationships → class diagram → code → patterns), SOLID check, common patterns used in LLD |
| 21 | lld-parking-lot | LLD: Parking Lot | class diagram + C# skeleton, strategy for spot allocation & pricing |
| 22 | lld-elevator | LLD: Elevator System | states, scheduling strategy, class diagram, C# skeleton |
| 23 | lld-library | LLD: Library Management | entities, borrowing rules, fines, notifications, C# skeleton |
| 24 | lld-splitwise | LLD: Expense Sharing (Splitwise) | split strategies, balances, simplify debts, C# skeleton |
| 25 | lld-vending-machine | LLD: Vending Machine | State pattern, inventory, payment, C# skeleton |
| 26 | lld-lru-cache | LLD: LRU Cache | requirements, O(1) design, thread-safety, generic C# implementation, TTL extension |
| 27 | lld-logger | LLD: Logging Framework | levels, appenders/sinks, formatters, chain of responsibility, async buffering, C# skeleton |
| 28 | lld-notification-dispatcher | LLD: Notification Dispatcher | Strategy + Factory + Observer, retries, templating, C# skeleton |

## microservices: Microservices & Messaging

| # | slug | title | scope |
|---|------|-------|-------|
| 1 | monolith-vs-microservices | Monolith, Modular Monolith & Microservices | definitions, when to split, bounded contexts, team topology, costs of distribution, strangler fig migration |
| 2 | communication-patterns | Service Communication | sync REST/gRPC vs async messaging, request-reply, commands vs events, API gateway (YARP, Azure API Management / AWS API Gateway), BFF, service mesh basics |
| 3 | message-brokers | RabbitMQ vs Kafka vs Azure Service Bus | concepts of each (exchanges/queues; topics/partitions/consumer groups/offsets; queues/topics/subscriptions/sessions), comparison table, AWS SQS/SNS/MSK/Kinesis, when to choose which |
| 4 | delivery-guarantees | Delivery Guarantees & Idempotency | at-most/at-least/exactly-once, idempotent consumers, dedup store, ordering & partition keys, poison messages, DLQ handling, retries with backoff |
| 5 | reliability-patterns | Outbox, Saga & Resilience | transactional outbox & inbox, saga orchestration vs choreography (diagrams), compensating actions, retry/timeout/circuit breaker/bulkhead, Polly |
| 6 | event-driven-design | Event-Driven Design | domain vs integration events, event schema & versioning, CQRS with read models, event sourcing basics, eventual consistency in the UI |
| 7 | dotnet-messaging | Messaging in .NET | MassTransit (consumers, sagas, outbox), NServiceBus, Azure.Messaging.ServiceBus SDK, Confluent.Kafka, RabbitMQ.Client, BackgroundService consumers, Dapr pub/sub |
| 8 | observability-cross-cutting | Observability & Cross-cutting Concerns | distributed tracing with OpenTelemetry & W3C trace context, correlation ids, centralised logging, metrics, health checks, service discovery, config, .NET Aspire |
| 9 | data-management | Data in Microservices | database per service, shared database anti-pattern, API composition, CQRS read models for reporting, distributed caching, eventual consistency |
| 10 | microservices-scenarios | Scenario Questions | order → payment → inventory → email failure recovery, duplicate email prevention, Kafka vs Service Bus choice, splitting a monolith, debugging a slow request across services |

## patterns: Design Patterns & Architecture

| # | slug | title | scope |
|---|------|-------|-------|
| 1 | solid | SOLID Principles | each principle with violating and fixed C# code, how they show in ASP.NET Core and Angular |
| 2 | design-principles | DRY, KISS, YAGNI & Friends | DRY vs WET (and wrong abstraction), KISS, YAGNI, composition over inheritance, Law of Demeter, separation of concerns, tell-don't-ask |
| 3 | creational-patterns | Creational Patterns | Singleton (thread-safe, Lazy<T>, why DI is better), Factory Method, Abstract Factory, Builder, Prototype; class diagrams + C# |
| 4 | structural-patterns | Structural Patterns | Adapter, Decorator (DI decoration, middleware as decorators), Facade, Proxy, Composite; class diagrams + C# |
| 5 | behavioral-patterns | Behavioral Patterns | Strategy, Observer (events, IObservable, RxJS), Command, Template Method, Chain of Responsibility (middleware), State, Mediator, Iterator; diagrams + C# |
| 6 | enterprise-patterns | Enterprise Patterns | Repository, Unit of Work, Specification, CQRS, MediatR & pipeline behaviours, Result pattern, Options pattern, Outbox (link) |
| 7 | architecture-styles | Architecture Styles | N-layer, Clean / Onion / Hexagonal (diagram), Vertical Slice, DDD tactical patterns (entities, value objects, aggregates, domain events), bounded contexts |
| 8 | angular-patterns | Front-end Architecture Patterns | smart/dumb (container/presentational), facade services, feature-based folders, core/shared, state ownership, standalone libraries/monorepo (Nx) |

## fundamentals: CS Fundamentals

| # | slug | title | scope |
|---|------|-------|-------|
| 1 | oop-concepts | OOP Concepts | classes/objects, 4 pillars language-agnostic, overloading vs overriding, composition vs aggregation vs association, coupling & cohesion, OOP vs functional |
| 2 | operating-systems | Operating Systems Basics | process vs thread, context switching, scheduling, memory (virtual memory, paging), deadlock conditions & prevention, mutex vs semaphore, concurrency vs parallelism |
| 3 | networking | Networking Basics | OSI vs TCP/IP model, TCP vs UDP, 3-way handshake, IP/ports, DNS resolution (diagram), load balancers, proxies, NAT |
| 4 | http-https | HTTP, HTTPS & the Web | HTTP methods & status codes, headers, HTTP/1.1 vs 2 vs 3, TLS handshake, cookies & sessions, WebSockets vs SSE vs polling, "what happens when you type a URL" |
| 5 | dbms-theory | DBMS Theory | ACID vs BASE, B-tree indexing, transactions, normalization recap, ER modelling, CAP recap |
| 6 | compilers-runtimes | Compilers & Runtimes | compiled vs interpreted vs JIT vs AOT, garbage collection approaches, managed vs unmanaged, how .NET and JS engines execute code |
| 7 | git | Git | branching strategies (GitFlow, trunk-based), merge vs rebase, cherry-pick, reset vs revert, stash, bisect, resolving conflicts, PR hygiene |
| 8 | agile-practices | Agile & Engineering Practices | Scrum ceremonies & roles, story points & estimation, Kanban, definition of done, code review etiquette, technical debt |

## security: Security

| # | slug | title | scope |
|---|------|-------|-------|
| 1 | owasp-top-10 | OWASP Top 10 | each category with a .NET and Angular mitigation |
| 2 | authn-authz-tokens | Sessions, JWT & Refresh Tokens | authN vs authZ, session cookies vs JWT, JWT structure & validation, refresh token rotation, where to store tokens in an SPA (memory vs HttpOnly cookie, BFF pattern) |
| 3 | oauth-oidc | OAuth 2.0 & OpenID Connect | roles, authorization code + PKCE flow (sequence diagram), client credentials, scopes vs claims, id token vs access token, Entra ID / Auth0 / Cognito |
| 4 | web-attacks | SQLi, XSS, CSRF, CORS & SSRF | how each attack works with vulnerable and fixed code in .NET/Angular, CORS misconfigurations |
| 5 | crypto-secrets | Hashing, Encryption & Secrets | hashing vs encryption vs encoding, password hashing (PBKDF2/Identity hasher/Argon2), symmetric vs asymmetric, TLS certs, Data Protection API, Key Vault (AWS: Secrets Manager/KMS), managed identity |
| 6 | secure-coding-checklist | Secure Coding Checklist | security headers, input validation, output encoding, least privilege, PII in logs, dependency scanning, rate limiting, audit logging |

## testing-devops: Testing, Docker, K8s & DevOps

| # | slug | title | scope |
|---|------|-------|-------|
| 1 | testing-strategy | Testing Strategy | test pyramid/trophy, unit vs integration vs e2e, TDD & BDD, test naming, AAA, test doubles (mock/stub/fake/spy), flaky tests, coverage myths |
| 2 | dotnet-unit-testing | Unit Testing in .NET | xUnit vs NUnit vs MSTest, Moq/NSubstitute, FluentAssertions alternatives, testing async, testing exceptions, theory/data-driven tests, testing time (TimeProvider) |
| 3 | dotnet-integration-testing | Integration Testing in .NET | WebApplicationFactory, replacing services, Testcontainers for SQL Server/Redis, Respawn, testing auth, contract tests |
| 4 | e2e-testing | End-to-End Testing | Playwright vs Cypress, page objects, test data, running in CI, flaky e2e mitigation |
| 5 | ci-cd | CI/CD Pipelines | CI vs CD vs continuous deployment, GitHub Actions and Azure DevOps YAML for a .NET API + Angular app, environments & approvals, secrets, blue-green & canary |
| 6 | docker-fundamentals | Docker Fundamentals | containers vs VMs (diagram), images, layers & cache, registries, Dockerfile instructions, volumes, networks, common commands, security basics (non-root, minimal images) |
| 7 | docker-dotnet-angular | Dockerising .NET & Angular | multi-stage Dockerfile for ASP.NET Core (chiseled images, non-root), Angular build + nginx, `dotnet publish` container support, docker-compose with API + SQL Server + Redis + Angular, env config, image size tips |
| 8 | kubernetes-core | Kubernetes Core Concepts | architecture (control plane, nodes, kubelet; diagram), Pod, ReplicaSet, Deployment, Service types, Ingress, Namespace, ConfigMap & Secret, kubectl basics |
| 9 | kubernetes-operations | Kubernetes in Practice | manifests for the .NET API + Angular, liveness/readiness/startup probes mapped to ASP.NET health checks, requests/limits, HPA, rolling updates & rollbacks, StatefulSet basics, Helm, AKS (AWS: EKS) |
| 10 | cloud-deployment | Deploying to Azure (and AWS) | App Service, Container Apps, AKS, Static Web Apps for Angular; AWS App Runner/ECS/EKS/S3+CloudFront; when to choose which; slots & zero-downtime |
| 11 | observability | Observability in Production | logs/metrics/traces, OpenTelemetry, Application Insights (AWS: CloudWatch/X-Ray), dashboards & alerts, SLI/SLO, debugging a production incident walkthrough |

## behavioral: Behavioral & HR (templates; no MCQs)

| # | slug | title | scope |
|---|------|-------|-------|
| 1 | tell-me-about-yourself | Tell Me About Yourself | structure (present-past-future), 60-90 s template with placeholders, example for a 3-4 yr .NET/Angular dev, mistakes |
| 2 | project-walkthrough | Project Walkthrough | 5-minute structure, architecture diagram template, your role, hardest problem, metrics, what you'd change; follow-up questions to expect |
| 3 | star-stories | STAR Story Bank | STAR method, story template, prompts for: conflict, failure, tight deadline, ownership, learning new tech, feedback, mentoring, disagreement with manager, production incident |
| 4 | hr-questions | Common HR Questions | why leaving, why this company, strengths/weaknesses, 5-year plan, gaps, relocation, with framing tips and sample answers |
| 5 | questions-to-ask | Questions to Ask the Interviewer | by interviewer type (engineer, manager, HR), red flags to listen for |
| 6 | salary-negotiation | Salary, Notice Period & Offers | researching ranges, answering expected CTC, negotiating, notice period/buyout, offer comparison checklist |
| 7 | interview-day-checklist | Interview Day Checklist | online/onsite setup, coding round habits (think aloud, test cases), design round whiteboard habits, post-interview notes template |

## revision: Revision (written after the sections)

| # | slug | title | scope |
|---|------|-------|-------|
| 1 | flashcards ✅ | Flashcards | (done) |
| 2 | cheat-csharp | Cheat Sheet: C# & .NET | one-page summary |
| 3 | cheat-aspnet | Cheat Sheet: ASP.NET Core | one-page summary |
| 4 | cheat-data | Cheat Sheet: EF Core & SQL | one-page summary |
| 5 | cheat-angular | Cheat Sheet: Angular & RxJS | one-page summary |
| 6 | cheat-web | Cheat Sheet: TypeScript & JavaScript | one-page summary |
| 7 | cheat-system-design | Cheat Sheet: System Design & Microservices | one-page summary |
| 8 | cheat-patterns-security | Cheat Sheet: Patterns, Security & DevOps | one-page summary |
