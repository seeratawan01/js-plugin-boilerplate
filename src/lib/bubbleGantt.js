// import dependencies
import { concat } from '../util/string';


export let bubbleGantt = (function () {

    'use strict';

    // Constructor
    let BubbleGantt = function (options) {
        // Default settings
        this.defaults = {
            selector: 'app',
            // Data
            tasks: [],
            links: [],
            owners: [],

            // Events
            onTaskCreated: () => {},
            onTaskUpdated: () => {},
            onTaskDeleted: () => {},

            onLinkCreated: () => {},
            onLinkUpdated: () => {},
            onLinkDeleted: () => {}
        };


        // Merge user options into defaults
        this.settings = Object.assign({}, this.defaults, options);

        config.bind(this)();
        init.bind(this)();
        bindEvents.bind(this)();
        loadData.bind(this)();

    };

    // Methods
    //

	/**
	 * A private method Init
	 */
    let init = function () {
        gantt.init(this.settings['selector']);
    };

    /**
     * A private method Config
     */
    let config = function () {
        gantt.scales = [
            { unit: "year", step: 1, format: "%Y" }
        ];
        gantt.config.date_format = "%Y-%m-%d %H:%i:%s";

        gantt.config.columns = [
            {name: "text", tree: true, width: 200, resize: true},
            {name: "start_date", align: "center", width: 80, resize: true},
            {name: "owner", align: "center", width: 75, label: "Owner", resize: true,
                template: function (task) {
                    if(task.type == gantt.config.types.project){
                        return "";
                    }

                    let store = gantt.getDatastore("resource");
                    let ownerValue = task.owner_id;
                    let singleResult = "";
                    let result = "Unassigned";

                    if (ownerValue) {
                        if (!(ownerValue instanceof Array)) {
                            ownerValue = [ownerValue];
                        }
                        ownerValue.forEach(function(ownerId) {
                            let owner = store.getItem(ownerId);
                            if (!owner)	{
                                return;
                            }
                            if (singleResult === "") {
                                result = singleResult = owner.text;
                                return;
                            }
                            if (result === singleResult) {
                                result = "<div class='owner-label' title='" + singleResult + "'>" + singleResult.substr(0, 1) + "</div>"
                            }
                            result += "<div class='owner-label' title='" + owner.text + "'>" + owner.text.substr(0, 1) + "</div>";
                        });
                    }

                    return result;
                }
            },
            {name: "duration", width: 60, align: "center"},
            {name: "add", width: 44}
        ];

        let resourceConfig = {
            columns: [
                {
                    name: "name", label: "Name", tree:true, template: function (resource) {
                        return resource.text;
                    }
                },
                {
                    name: "workload", label: "Workload", template: function (resource) {
                        let tasks;
                        let store = gantt.getDatastore(gantt.config.resource_store),
                            field = gantt.config.resource_property;

                        if(store.hasChild(resource.id)){
                            tasks = gantt.getTaskBy(field, store.getChildren(resource.id));
                        }else{
                            tasks = gantt.getTaskBy(field, resource.id);
                        }

                        let totalDuration = 0;
                        for (let i = 0; i < tasks.length; i++) {
                            totalDuration += tasks[i].duration;
                        }

                        return (totalDuration || 0) * 8 + "h";
                    }
                }
            ]
        };

        gantt.templates.resource_cell_class = function(start_date, end_date, resource, tasks){
            let css = [];
            css.push("resource_marker");
            if (tasks.length <= 1) {
                css.push("workday_ok");
            } else {
                css.push("workday_over");
            }
            return css.join(" ");
        };

        gantt.templates.resource_cell_value = function(start_date, end_date, resource, tasks){
            return "<div>" + tasks.length * 8 + "</div>";
        };

        gantt.locale.labels.section_owner = "Owner";
        gantt.config.lightbox.sections = [
            {name: "description", height: 38, map_to: "text", type: "textarea", focus: true},
            {name: "owner", height: 22, map_to: "owner_id", type: "select", options: gantt.serverList("people")},
            {name: "time", type: "duration", map_to: "auto"}
        ];

        gantt.config.resource_store = "resource";
        gantt.config.resource_property = "owner_id";
        gantt.config.order_branch = true;
        gantt.config.open_tree_initially = true;
        gantt.config.layout = {
            css: "gantt_container",
            rows: [
                {
                    cols: [
                        {view: "grid", group:"grids", scrollY: "scrollVer"},
                        {resizer: true, width: 1},
                        {view: "timeline", scrollX: "scrollHor", scrollY: "scrollVer"},
                        {view: "scrollbar", id: "scrollVer", group:"vertical"}
                    ],
                    gravity:2
                },
                {resizer: true, width: 1},
                {
                    config: resourceConfig,
                    cols: [
                        {view: "resourceGrid", group:"grids", width: 435, scrollY: "resourceVScroll" },
                        {resizer: true, width: 1},
                        {view: "resourceTimeline", scrollX: "scrollHor", scrollY: "resourceVScroll"},
                        {view: "scrollbar", id: "resourceVScroll", group:"vertical"}
                    ],
                    gravity:1
                },
                {view: "scrollbar", id: "scrollHor"}
            ]
        };


        this.resourcesStore = gantt.createDatastore({
            name: gantt.config.resource_store,
            type: "treeDatastore",
            initItem: function (item) {
                item.parent = item.parent || gantt.config.root_id;
                item[gantt.config.resource_property] = item.parent;
                item.open = true;
                return item;
            }
        });

    }

    /**
     * A private method BindEvent and Resources
     */
    let bindEvents = function () {

        this.resourcesStore.attachEvent("onParse", () => {
            let people = [];
            console.log(this)
            this.resourcesStore.eachItem((res) => {
                if(!this.resourcesStore.hasChild(res.id)){
                    let copy = gantt.copy(res);
                    copy.key = res.id;
                    copy.label = res.text;
                    people.push(copy);
                }
            });
            gantt.updateCollection("people", people);
        });

        gantt.createDataProcessor({
            task: {
                create: (data) => this.settings.onTaskCreated(data),
                update: (data, id) => this.settings.onTaskUpdated(data, id),
                delete: (id) => this.settings.onTaskDeleted(id)
            },
            link: {
                create: (data) => this.settings.onLinkCreated(data),
                update: (data, id) => this.settings.onLinkUpdated(data, id),
                delete: (id) => this.settings.onLinkDeleted(id),
            }
        });
    }

    /**
     * A private method Load data
     */
    let loadData = function () {

        this.resourcesStore.parse(this.settings['owners']);

        gantt.parse({
            data: this.settings['tasks'],
            links: this.settings['links'],
        });
    }

	/**
	 * A public method
	 */
    BubbleGantt.prototype.doSomething = function () {
        // somePrivateMethod();
        console.log("Public")
        // Code goes here...
    };

    return BubbleGantt;

})();
