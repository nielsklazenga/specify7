"use strict";

const $ = require('jquery');
const Q = require('q');
const Backbone = require('./backbone.js');

const router = require('./router.js');
const app = require('./specifyapp.js');
const schema = require('./schema.js');
const navigation = require('./navigation.js');


const EmptyView = Backbone.View.extend({
    __name__: "EmptyView",
    render() {
        this.$el.empty();
    }
});

module.exports = function() {
    router.route('workbench-mapping/:id/', 'workbench-mapping', function(id) {
        require.ensure(['./wbtemplateeditor.js'], function(require) {
            const Editor = require('./wbtemplateeditor.js');
            app.setTitle("Edit Mapping");
            app.setCurrentView(new EmptyView());

            const wb = new schema.models.Workbench.Resource({id: id});
            wb.rget('workbenchtemplate', true).fail(app.handleError).done(
                template => {
                    const editor = new Editor({existingTemplate: template}).render();
                    editor.on('created', template => {
                        editor.close();
                        template.save().done( () => navigation.go('/workbench/' + wb.id + '/'));
                    }).on('closed', () => navigation.go('/workbench/' + wb.id + '/'));
                }
            );
        }, 'wbtemplateeditor');
    });
};

