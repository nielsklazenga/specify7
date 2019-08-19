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
            const goBackToWB = () => navigation.go('/workbench/' + wb.id + '/');

            $(
                '<div><p>If these template mappings are modified while this dataset is open '
                    + 'in another session, that session will be unable to save any changes.</p>'
                    + '<p>It is recommended that if any other browser or tab is showing this dataset, '
                    + 'any changes be saved and the dataset closed before continuing.</p></div>'
            ).dialog({
                title: "Caution",
                maxHeight: 400,
                modal: true,
                close() { $(this).remove(); },
                buttons: [
                    {
                        text: 'Continue',
                        click() {
                            wb.rget('workbenchtemplate', true).fail(app.handleError).done(
                                template => {
                                    $(this).dialog('close');

                                    const editor = new Editor({existingTemplate: template}).render();
                                    editor.on('created', template => {
                                        editor.close();
                                        template.save().done( goBackToWB );
                                    }).on('closed', goBackToWB);
                                }
                            );
                        }
                    },
                    { text: 'Cancel', click: goBackToWB }
                ]
            });

        }, 'wbtemplateeditor');
    });
};
